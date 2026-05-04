package com.greenplan.api.cart;

import java.math.BigDecimal;

public record CartItemDto(
        Long id,
        Long productId,
        String sku,
        String name,
        String description,
        BigDecimal price,
        String category,
        String plantingMonth,
        String suitableRegion,
        String imageUrl,
        Integer onlineStock,
        Integer quantity
) {
}
