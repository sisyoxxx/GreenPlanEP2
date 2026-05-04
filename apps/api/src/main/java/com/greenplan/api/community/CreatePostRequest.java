package com.greenplan.api.community;

import jakarta.validation.constraints.NotBlank;

public record CreatePostRequest(
        @NotBlank String topic,
        @NotBlank String title,
        @NotBlank String content,
        String imageUrl
) {
}
