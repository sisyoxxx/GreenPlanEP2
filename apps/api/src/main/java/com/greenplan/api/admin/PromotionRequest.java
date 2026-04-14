package com.greenplan.api.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PromotionRequest(
        @NotBlank String title,
        @NotBlank String strategyType,
        String description
) {
}
