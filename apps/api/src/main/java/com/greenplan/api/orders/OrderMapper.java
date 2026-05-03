package com.greenplan.api.orders;

import com.greenplan.api.auth.User;
import com.greenplan.api.auth.UserRepository;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class OrderMapper {

    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;

    public OrderMapper(OrderItemRepository orderItemRepository, UserRepository userRepository) {
        this.orderItemRepository = orderItemRepository;
        this.userRepository = userRepository;
    }

    public List<OrderItemDto> listItems(Long orderId) {
        return orderItemRepository.findByOrderIdIn(List.of(orderId)).stream()
                .map(this::toItemDto)
                .toList();
    }

    public Map<Long, List<OrderItemDto>> buildItemMap(List<Long> orderIds) {
        Map<Long, List<OrderItemDto>> itemMap = new HashMap<>();
        for (OrderItem item : orderItemRepository.findByOrderIdIn(orderIds)) {
            itemMap.computeIfAbsent(item.getOrderId(), key -> new ArrayList<>()).add(toItemDto(item));
        }
        return itemMap;
    }

    public Map<Long, String> buildBuyerNameMap(List<Order> orders) {
        List<Long> buyerIds = orders.stream()
                .map(Order::getBuyerId)
                .filter(id -> id != null)
                .distinct()
                .toList();

        Map<Long, String> buyerNameMap = new HashMap<>();
        for (User user : userRepository.findAllById(buyerIds)) {
            buyerNameMap.put(user.getId(), user.getUsername());
        }
        return buyerNameMap;
    }

    public OrderItemDto toItemDto(OrderItem item) {
        return new OrderItemDto(
                item.getProductId(),
                item.getProductNameSnapshot(),
                item.getPriceSnapshot(),
                item.getQuantity(),
                item.getLineTotal()
        );
    }

    public OrderDetailDto toDetailDto(Order order, List<OrderItemDto> items) {
        return new OrderDetailDto(
                order.getId(),
                order.getOrderNo(),
                order.getStatus() == null ? null : order.getStatus().name(),
                order.getTotalAmount(),
                order.getShippingCarrier(),
                order.getTrackingNo(),
                order.getShippingStatus() == null ? null : order.getShippingStatus().name(),
                order.getShippedAt(),
                order.getCreatedAt(),
                items
        );
    }
}
