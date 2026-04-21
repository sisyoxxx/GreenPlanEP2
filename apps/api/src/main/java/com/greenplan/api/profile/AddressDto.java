package com.greenplan.api.profile;

import java.time.LocalDateTime;

public record AddressDto(
        Long id,
        Long userId,
        String addressText,
        boolean isDefault,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}

