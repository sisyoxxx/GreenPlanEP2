package com.greenplan.api.profile;

import com.greenplan.api.auth.RoleCode;

public record MyProfileDto(
        Long id,
        String username,
        RoleCode role,
        String nickname,
        String gender,
        String phone,
        String avatarDataUrl
) {
}

