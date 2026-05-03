package com.greenplan.api.tutorial;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record SwapOrderRequest(
        @NotBlank
        @Pattern(regexp = "^(?i)(UP|DOWN)$", message = "direction must be UP or DOWN")
        String direction
) {
}
