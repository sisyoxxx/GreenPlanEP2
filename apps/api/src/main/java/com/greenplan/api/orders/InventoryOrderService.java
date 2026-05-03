package com.greenplan.api.orders;

import com.greenplan.api.auth.User;
import com.greenplan.api.auth.UserRepository;
import com.greenplan.api.common.AuthorizationAssert;
import com.greenplan.api.common.OrderStatus;
import com.greenplan.api.common.ShippingStatus;
import com.greenplan.api.security.JwtUserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class InventoryOrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final OrderMapper orderMapper;

    public InventoryOrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            UserRepository userRepository,
            OrderMapper orderMapper
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.userRepository = userRepository;
        this.orderMapper = orderMapper;
    }

    public List<InventoryOrderDto> listAll(JwtUserPrincipal principal) {
        AuthorizationAssert.requireInventoryManager(principal);

        List<Order> orders = orderRepository.findAllByOrderByIdDesc();
        if (orders.isEmpty()) {
            return List.of();
        }

        List<Long> orderIds = orders.stream().map(Order::getId).toList();
        Map<Long, List<OrderItemDto>> itemMap = orderMapper.buildItemMap(orderIds);
        Map<Long, String> buyerNameMap = orderMapper.buildBuyerNameMap(orders);

        return orders.stream()
                .map(order -> toDto(order, buyerNameMap.get(order.getBuyerId()), itemMap.getOrDefault(order.getId(), List.of())))
                .toList();
    }

    @Transactional
    public InventoryOrderDto ship(Long orderId, ShipOrderRequest request, JwtUserPrincipal principal) {
        AuthorizationAssert.requireInventoryManager(principal);
        String trackingNo = request == null ? null : request.trackingNo();
        Order saved = shipOrder(orderId, trackingNo);
        String buyerUsername = userRepository.findById(saved.getBuyerId()).map(User::getUsername).orElse(null);
        return toDto(saved, buyerUsername, orderMapper.listItems(saved.getId()));
    }

    @Transactional
    public List<InventoryOrderDto> batchShip(BatchShipOrderRequest request, JwtUserPrincipal principal) {
        AuthorizationAssert.requireInventoryManager(principal);

        List<Order> shippedOrders = orderRepository.findAllById(request.orderIds());
        for (Order order : shippedOrders) {
            performShip(order, null);
        }
        orderRepository.saveAll(shippedOrders);

        List<Long> orderIds = shippedOrders.stream().map(Order::getId).toList();
        Map<Long, String> buyerNameMap = orderMapper.buildBuyerNameMap(shippedOrders);
        Map<Long, List<OrderItemDto>> itemMap = orderMapper.buildItemMap(orderIds);

        return shippedOrders.stream()
                .map(order -> toDto(order, buyerNameMap.get(order.getBuyerId()), itemMap.getOrDefault(order.getId(), List.of())))
                .toList();
    }

    @Transactional
    public InventoryOrderDto updateLogistics(Long orderId, UpdateLogisticsRequest request, JwtUserPrincipal principal) {
        AuthorizationAssert.requireInventoryManager(principal);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("订单不存在"));

        ShippingStatus shippingStatus = parseShippingStatus(request.shippingStatus());
        order.setShippingStatus(shippingStatus);

        if (shippingStatus == ShippingStatus.DELIVERED) {
            order.setStatus(OrderStatus.DELIVERED);
        } else if (shippingStatus == ShippingStatus.IN_TRANSIT && order.getStatus() == OrderStatus.PAID) {
            order.setStatus(OrderStatus.SHIPPED);
        }

        Order saved = orderRepository.save(order);
        String buyerUsername = userRepository.findById(saved.getBuyerId()).map(User::getUsername).orElse(null);
        return toDto(saved, buyerUsername, orderMapper.listItems(saved.getId()));
    }

    private Order shipOrder(Long orderId, String trackingNo) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("订单不存在"));
        performShip(order, trackingNo);
        return orderRepository.save(order);
    }

    private void performShip(Order order, String trackingNo) {
        if (order.getStatus() != OrderStatus.PAID) {
            throw new IllegalArgumentException("当前订单状态不允许发货: " + order.getStatus());
        }

        order.setShippingCarrier(null);
        order.setTrackingNo(trackingNo);
        order.setShippingStatus(ShippingStatus.IN_TRANSIT);
        order.setShippedAt(LocalDateTime.now());
        order.setStatus(OrderStatus.SHIPPED);
    }

    private ShippingStatus parseShippingStatus(String value) {
        if (value == null) {
            return null;
        }
        try {
            return ShippingStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("无效的物流状态: " + value);
        }
    }

    private InventoryOrderDto toDto(Order order, String buyerUsername, List<OrderItemDto> items) {
        return new InventoryOrderDto(
                order.getId(),
                order.getOrderNo(),
                order.getStatus().name(),
                order.getTotalAmount(),
                order.getBuyerId(),
                buyerUsername,
                order.getShippingCarrier(),
                order.getTrackingNo(),
                order.getShippingStatus() == null ? null : order.getShippingStatus().name(),
                order.getShippedAt(),
                order.getCreatedAt(),
                items
        );
    }
}
