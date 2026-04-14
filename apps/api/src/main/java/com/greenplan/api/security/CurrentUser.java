package com.greenplan.api.security;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
public class CurrentUser {
    public JwtUserPrincipal get(Authentication authentication) {
        return (JwtUserPrincipal) authentication.getPrincipal();
    }
}
