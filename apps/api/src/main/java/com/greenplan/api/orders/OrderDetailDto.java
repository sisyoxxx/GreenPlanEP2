package com.greenplan.api.orders;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderDetailDto(
        Long id,
        String orderNo,
        String status,
        BigDecimal totalAmount,
        String shippingCarrier,
        String trackingNo,
        String shippingStatus,
        LocalDateTime shippedAt,
        LocalDateTime createdAt,
        List<OrderItemDto> items
) {
}
