package com.greenplan.api.catalog;

import java.math.BigDecimal;

public record ProductDto(
        Long id,
        String sku,
        String name,
        String description,
        BigDecimal price,
        String status,
        String category,
        String plantingMonth,
        String suitableRegion,
        String imageUrl,
        Integer onlineStock
) {
}
