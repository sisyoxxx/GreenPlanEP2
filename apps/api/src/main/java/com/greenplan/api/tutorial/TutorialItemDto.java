package com.greenplan.api.tutorial;

public record TutorialItemDto(
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
        boolean favoriteDefault
) {
}
