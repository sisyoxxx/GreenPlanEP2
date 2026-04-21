package com.greenplan.api.tutorial;

import java.util.List;

public record TutorialListDto(
        List<TutorialItemDto> hotTutorials,
        List<TutorialItemDto> tutorials
) {
}
