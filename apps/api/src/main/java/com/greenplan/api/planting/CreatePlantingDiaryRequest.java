package com.greenplan.api.planting;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreatePlantingDiaryRequest(
        @NotBlank String title,
        @NotBlank String plantName,
        @NotBlank String category,
        @NotNull LocalDate diaryDate,
        String note,
        String imageName
) {
}
