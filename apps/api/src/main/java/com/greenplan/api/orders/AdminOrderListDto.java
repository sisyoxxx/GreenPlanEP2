package com.greenplan.api.orders;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AdminOrderListDto(
        Long id,
        String orderNo,
        String status,
        BigDecimal totalAmount,
        Long buyerId,
        String buyerUsername,
        String shippingStatus,
        LocalDateTime createdAt,
        LocalDateTime shippedAt
) {
}
