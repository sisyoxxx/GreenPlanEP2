package com.greenplan.api.ai;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record AiChatRequest(
        @NotEmpty
        List<@Valid AiChatMessage> messages
) {
}

