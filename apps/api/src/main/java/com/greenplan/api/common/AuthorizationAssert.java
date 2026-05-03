package com.greenplan.api.common;

import com.greenplan.api.auth.RoleCode;
import com.greenplan.api.security.JwtUserPrincipal;

public final class AuthorizationAssert {

    private AuthorizationAssert() {
    }

    public static void requireRole(JwtUserPrincipal principal, RoleCode requiredRole, String message) {
        if (principal == null || principal.getRole() != requiredRole) {
            throw new IllegalArgumentException(message);
        }
    }

    public static void requireRole(JwtUserPrincipal principal, RoleCode requiredRole) {
        requireRole(principal, requiredRole, "无权执行此操作");
    }

    public static void requireAdmin(JwtUserPrincipal principal) {
        requireRole(principal, RoleCode.ADMIN, "仅管理员可执行此操作");
    }

    public static void requireBuyer(JwtUserPrincipal principal) {
        requireRole(principal, RoleCode.BUYER, "仅买家可下单");
    }

    public static void requireInventoryManager(JwtUserPrincipal principal) {
        requireRole(principal, RoleCode.INVENTORY_MANAGER, "仅库存管理员可操作");
    }
}
