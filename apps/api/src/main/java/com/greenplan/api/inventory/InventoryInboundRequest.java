package com.greenplan.api.inventory;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record InventoryInboundRequest(
        @NotNull Long productId,
        @NotNull @Min(1) Integer quantity,
        String note
) {
}
