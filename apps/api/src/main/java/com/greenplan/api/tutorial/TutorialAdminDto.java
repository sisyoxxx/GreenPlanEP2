package com.greenplan.api.tutorial;

import java.time.LocalDateTime;

public record TutorialAdminDto(
        Long id,
        String displayArea,
        Integer displayOrder,
        String tag,
        String categoryCode,
        String title,
        String description,
        String difficulty,
        Integer durationMinutes,
        String backgroundStyle,
        String mediaUrl,
        String mediaType,
        String detailVideoUrl,
        boolean favoriteDefault,
        boolean published,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
