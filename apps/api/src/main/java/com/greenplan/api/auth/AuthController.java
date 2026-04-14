package com.greenplan.api.auth;

import com.greenplan.api.common.ApiResponse;
import com.greenplan.api.security.JwtUserPrincipal;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refresh(@RequestParam String refreshToken) {
        return ApiResponse.ok(authService.refresh(refreshToken));
    }

    @GetMapping("/me")
    public ApiResponse<UserProfile> me(Authentication authentication) {
        JwtUserPrincipal principal = (JwtUserPrincipal) authentication.getPrincipal();
        return ApiResponse.ok(new UserProfile(principal.getId(), principal.getUsername(), principal.getRole()));
    }
}
