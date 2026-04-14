package com.greenplan.api.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PromotionPostRequest(
        @NotNull Long promotionId,
        @NotBlank String channel,
        @NotBlank String content
) {
}
