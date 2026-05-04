package com.greenplan.api.community;

import jakarta.validation.constraints.NotBlank;

public record CreateCommentRequest(
        @NotBlank String content,
        Long parentCommentId
) {
}
