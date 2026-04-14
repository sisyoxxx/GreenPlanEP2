package com.greenplan.api.inventory;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record WarningThresholdRequest(
        @NotNull Long productId,
        @NotNull @Min(0) Integer warningThreshold
) {
}
