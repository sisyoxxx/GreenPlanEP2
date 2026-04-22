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
        String variety,
        String plantingMonth,
        String suitableRegion,
        String origin,
        BigDecimal germinationRate,
        String imageUrl,
        Integer onlineStock,
        Integer sales
) {
}
