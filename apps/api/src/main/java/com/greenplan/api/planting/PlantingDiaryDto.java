package com.greenplan.api.planting;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PlantingDiaryDto(
        Long id,
        Long userId,
        String title,
        String plantName,
        String category,
        LocalDate diaryDate,
        String note,
        String imageName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
