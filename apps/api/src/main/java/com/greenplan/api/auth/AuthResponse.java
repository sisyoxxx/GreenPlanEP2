package com.greenplan.api.auth;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        UserProfile user
) {
}
