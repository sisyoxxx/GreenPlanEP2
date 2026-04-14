package com.greenplan.api.auth;

public record UserProfile(
        Long id,
        String username,
        RoleCode role
) {
}
