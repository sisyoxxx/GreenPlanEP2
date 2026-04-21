package com.greenplan.api.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AiChatMessage(
        @NotNull
        String role,
        @NotBlank
        String content
) {
}

