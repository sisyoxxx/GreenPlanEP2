package com.greenplan.api.admin;

import jakarta.validation.constraints.NotBlank;

public record PromotionRequest(
        @NotBlank String title,
        @NotBlank String strategyType,
        String description,
        String imageUrl
) {
}
