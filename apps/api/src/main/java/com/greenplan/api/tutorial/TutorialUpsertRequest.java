package com.greenplan.api.tutorial;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TutorialUpsertRequest(
        @NotBlank @Size(max = 16) String displayArea,
        @NotNull @Min(1) Integer displayOrder,
        @NotBlank @Size(max = 32) String tag,
        @Size(max = 32) String categoryCode,
        @NotBlank @Size(max = 255) String title,
        @NotBlank String description,
        @Size(max = 32) String difficulty,
        @Min(1) @Max(600) Integer durationMinutes,
        @Size(max = 255) String backgroundStyle,
        String mediaUrl,
        @Size(max = 16) String mediaType,
        boolean favoriteDefault,
        boolean published
) {
}
