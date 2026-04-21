package com.greenplan.api.orders;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record InventoryOrderDto(
        Long id,
        String orderNo,
        String status,
        BigDecimal totalAmount,
        Long buyerId,
        String buyerUsername,
        String shippingCarrier,
        String trackingNo,
        String shippingStatus,
        LocalDateTime shippedAt,
        LocalDateTime createdAt,
        List<OrderItemDto> items
) {
}

