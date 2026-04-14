package com.greenplan.api.catalog;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ProductUpsertRequest(
        @NotBlank String sku,
        @NotBlank String name,
        String description,
        @NotNull @DecimalMin("0.01") BigDecimal price,
        @NotBlank String category,
        @NotBlank String plantingMonth,
        @NotBlank String suitableRegion,
        String imageUrl,
        Integer initialStock
) {
}
