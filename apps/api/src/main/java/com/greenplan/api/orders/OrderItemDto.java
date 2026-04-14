package com.greenplan.api.orders;

import java.math.BigDecimal;

public record OrderItemDto(
        Long productId,
        String productName,
        BigDecimal price,
        Integer quantity,
        BigDecimal lineTotal
) {
}
