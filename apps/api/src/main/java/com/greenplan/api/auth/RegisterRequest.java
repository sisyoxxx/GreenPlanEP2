package com.greenplan.api.auth;

import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(
        @NotBlank String username,
        @NotBlank String password,
        RoleCode roleCode
) {
}
