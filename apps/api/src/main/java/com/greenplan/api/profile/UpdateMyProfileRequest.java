package com.greenplan.api.profile;

public record UpdateMyProfileRequest(
        String username,
        String nickname,
        String gender,
        String phone,
        String avatarDataUrl
) {
}
