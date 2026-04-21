package com.greenplan.api.inventory;

public record InventoryItemDto(
        Long id,
        Long productId,
        String sku,
        String name,
        Integer onlineStock,
        Integer warningThreshold
) {
}

