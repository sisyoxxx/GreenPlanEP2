package com.greenplan.api.profile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpsertAddressRequest(
        @NotBlank
        @Size(max = 512)
        String addressText,
        @NotNull
        Boolean isDefault
) {
}

