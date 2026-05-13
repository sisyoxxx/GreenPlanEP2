package com.greenplan.api.security;

import com.greenplan.api.common.exception.AuthenticationRequiredException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof JwtUserPrincipal) {
            return ((JwtUserPrincipal) principal).getId();
        }
        return null;
    }

    public static JwtUserPrincipal currentPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        Object principal = auth.getPrincipal();
        return principal instanceof JwtUserPrincipal ? (JwtUserPrincipal) principal : null;
    }

    public static Long requireUserId() {
        Long userId = currentUserId();
        if (userId == null) {
            throw new AuthenticationRequiredException("请先登录");
        }
        return userId;
    }

    public static JwtUserPrincipal requirePrincipal() {
        JwtUserPrincipal principal = currentPrincipal();
        if (principal == null) {
            throw new AuthenticationRequiredException("请先登录");
        }
        return principal;
    }
}
