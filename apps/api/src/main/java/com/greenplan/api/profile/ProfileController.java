package com.greenplan.api.profile;

import com.greenplan.api.common.ApiResponse;
import com.greenplan.api.security.JwtUserPrincipal;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/me")
    public ApiResponse<MyProfileDto> me(Authentication authentication) {
        JwtUserPrincipal principal = (JwtUserPrincipal) authentication.getPrincipal();
        return ApiResponse.ok(profileService.getMyProfile(principal.getId()));
    }

    @PutMapping("/me")
    public ApiResponse<MyProfileDto> updateMe(Authentication authentication, @RequestBody UpdateMyProfileRequest request) {
        JwtUserPrincipal principal = (JwtUserPrincipal) authentication.getPrincipal();
        return ApiResponse.ok(profileService.updateMyProfile(principal.getId(), request));
    }

    @GetMapping("/me/addresses")
    public ApiResponse<List<AddressDto>> myAddresses(Authentication authentication) {
        JwtUserPrincipal principal = (JwtUserPrincipal) authentication.getPrincipal();
        return ApiResponse.ok(profileService.listAddresses(principal.getId()));
    }

    @PostMapping("/me/addresses")
    public ApiResponse<AddressDto> createAddress(Authentication authentication, @Valid @RequestBody UpsertAddressRequest request) {
        JwtUserPrincipal principal = (JwtUserPrincipal) authentication.getPrincipal();
        return ApiResponse.ok(profileService.createAddress(principal.getId(), request));
    }

    @PutMapping("/me/addresses/{id}")
    public ApiResponse<AddressDto> updateAddress(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpsertAddressRequest request
    ) {
        JwtUserPrincipal principal = (JwtUserPrincipal) authentication.getPrincipal();
        return ApiResponse.ok(profileService.updateAddress(principal.getId(), id, request));
    }

    @DeleteMapping("/me/addresses/{id}")
    public ApiResponse<Void> deleteAddress(Authentication authentication, @PathVariable Long id) {
        JwtUserPrincipal principal = (JwtUserPrincipal) authentication.getPrincipal();
        profileService.deleteAddress(principal.getId(), id);
        return ApiResponse.ok("OK");
    }
}

