package com.greenplan.api.orders;

import com.greenplan.api.auth.RoleCode;
import com.greenplan.api.auth.User;
import com.greenplan.api.auth.UserRepository;
import com.greenplan.api.security.JwtUserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class InventoryOrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;

    public InventoryOrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            UserRepository userRepository
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.userRepository = userRepository;
    }

    public List<InventoryOrderDto> listAll(JwtUserPrincipal principal) {
        requireInventoryManager(principal);

        List<Order> orders = orderRepository.findAllByOrderByIdDesc();
        if (orders.isEmpty()) {
            return List.of();
        }

        List<Long> orderIds = orders.stream().map(Order::getId).toList();
        Map<Long, List<OrderItemDto>> itemMap = buildItemMap(orderIds);
        Map<Long, String> buyerNameMap = buildBuyerNameMap(orders);

        return orders.stream()
                .map(order -> toDto(order, buyerNameMap.get(order.getBuyerId()), itemMap.getOrDefault(order.getId(), List.of())))
                .toList();
    }

    @Transactional
    public InventoryOrderDto ship(Long orderId, ShipOrderRequest request, JwtUserPrincipal principal) {
        requireInventoryManager(principal);
        String trackingNo = request == null ? null : request.trackingNo();
        Order saved = shipOrder(orderId, trackingNo);
        String buyerUsername = userRepository.findById(saved.getBuyerId()).map(User::getUsername).orElse(null);
        return toDto(saved, buyerUsername, listItems(saved.getId()));
    }

    @Transactional
    public List<InventoryOrderDto> batchShip(BatchShipOrderRequest request, JwtUserPrincipal principal) {
        requireInventoryManager(principal);

        List<Order> shippedOrders = new ArrayList<>();
        for (Long orderId : request.orderIds()) {
            shippedOrders.add(shipOrder(orderId, null));
        }

        Map<Long, String> buyerNameMap = buildBuyerNameMap(shippedOrders);
        Map<Long, List<OrderItemDto>> itemMap = buildItemMap(shippedOrders.stream().map(Order::getId).toList());

        return shippedOrders.stream()
                .map(order -> toDto(order, buyerNameMap.get(order.getBuyerId()), itemMap.getOrDefault(order.getId(), List.of())))
                .toList();
    }

    @Transactional
    public InventoryOrderDto updateLogistics(Long orderId, UpdateLogisticsRequest request, JwtUserPrincipal principal) {
        requireInventoryManager(principal);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("订单不存在"));

        String shippingStatus = request.shippingStatus();
        order.setShippingStatus(shippingStatus);
        if ("DELIVERED".equalsIgnoreCase(shippingStatus)) {
            order.setStatus("DELIVERED");
        } else if ("IN_TRANSIT".equalsIgnoreCase(shippingStatus) && "PAID".equalsIgnoreCase(order.getStatus())) {
            order.setStatus("SHIPPED");
        }

        Order saved = orderRepository.save(order);
        String buyerUsername = userRepository.findById(saved.getBuyerId()).map(User::getUsername).orElse(null);
        return toDto(saved, buyerUsername, listItems(saved.getId()));
    }

    private Order shipOrder(Long orderId, String trackingNo) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("订单不存在"));
        if (!"PAID".equalsIgnoreCase(order.getStatus())) {
            throw new IllegalArgumentException("当前订单状态不允许发货: " + order.getStatus());
        }

        order.setShippingCarrier(null);
        order.setTrackingNo(trackingNo);
        order.setShippingStatus("IN_TRANSIT");
        order.setShippedAt(LocalDateTime.now());
        order.setStatus("SHIPPED");

        return orderRepository.save(order);
    }

    private void requireInventoryManager(JwtUserPrincipal principal) {
        if (principal.getRole() != RoleCode.INVENTORY_MANAGER) {
            throw new IllegalArgumentException("仅库存管理员可操作");
        }
    }

    private List<OrderItemDto> listItems(Long orderId) {
        return orderItemRepository.findByOrderIdIn(List.of(orderId)).stream()
                .map(item -> new OrderItemDto(
                        item.getProductId(),
                        item.getProductNameSnapshot(),
                        item.getPriceSnapshot(),
                        item.getQuantity(),
                        item.getLineTotal()
                ))
                .toList();
    }

    private Map<Long, List<OrderItemDto>> buildItemMap(List<Long> orderIds) {
        Map<Long, List<OrderItemDto>> itemMap = new HashMap<>();
        for (OrderItem item : orderItemRepository.findByOrderIdIn(orderIds)) {
            itemMap.computeIfAbsent(item.getOrderId(), key -> new ArrayList<>())
                    .add(new OrderItemDto(
                            item.getProductId(),
                            item.getProductNameSnapshot(),
                            item.getPriceSnapshot(),
                            item.getQuantity(),
                            item.getLineTotal()
                    ));
        }
        return itemMap;
    }

    private Map<Long, String> buildBuyerNameMap(List<Order> orders) {
        Set<Long> buyerIds = new HashSet<>();
        for (Order order : orders) {
            if (order.getBuyerId() != null) {
                buyerIds.add(order.getBuyerId());
            }
        }

        Map<Long, String> buyerNameMap = new HashMap<>();
        for (User user : userRepository.findAllById(buyerIds)) {
            buyerNameMap.put(user.getId(), user.getUsername());
        }
        return buyerNameMap;
    }

    private InventoryOrderDto toDto(Order order, String buyerUsername, List<OrderItemDto> items) {
        return new InventoryOrderDto(
                order.getId(),
                order.getOrderNo(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getBuyerId(),
                buyerUsername,
                order.getShippingCarrier(),
                order.getTrackingNo(),
                order.getShippingStatus(),
                order.getShippedAt(),
                order.getCreatedAt(),
                items
        );
    }
}
