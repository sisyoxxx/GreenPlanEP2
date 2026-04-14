package com.greenplan.api.security;

import com.greenplan.api.auth.RoleCode;
import lombok.Getter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;

@Getter
public class JwtUserPrincipal {
    private final Long id;
    private final String username;
    private final RoleCode role;

    public JwtUserPrincipal(Long id, String username, RoleCode role) {
        this.id = id;
        this.username = username;
        this.role = role;
    }

    public UsernamePasswordAuthenticationToken toAuthentication() {
        return new UsernamePasswordAuthenticationToken(this, null,
                List.of(new SimpleGrantedAuthority("ROLE_" + role.name())));
    }
}
