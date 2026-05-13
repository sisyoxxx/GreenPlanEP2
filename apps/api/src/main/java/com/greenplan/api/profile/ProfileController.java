package com.greenplan.api.profile;

import com.greenplan.api.common.ApiResponse;
import com.greenplan.api.security.SecurityUtils;
import jakarta.validation.Valid;
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
    public ApiResponse<MyProfileDto> me() {
        return ApiResponse.ok(profileService.getMyProfile(SecurityUtils.requirePrincipal().getId()));
    }

    @PutMapping("/me")
    public ApiResponse<MyProfileDto> updateMe(@RequestBody UpdateMyProfileRequest request) {
        return ApiResponse.ok(profileService.updateMyProfile(SecurityUtils.requirePrincipal().getId(), request));
    }

    @GetMapping("/me/addresses")
    public ApiResponse<List<AddressDto>> myAddresses() {
        return ApiResponse.ok(profileService.listAddresses(SecurityUtils.requirePrincipal().getId()));
    }

    @PostMapping("/me/addresses")
    public ApiResponse<AddressDto> createAddress(@Valid @RequestBody UpsertAddressRequest request) {
        return ApiResponse.ok(profileService.createAddress(SecurityUtils.requirePrincipal().getId(), request));
    }

    @PutMapping("/me/addresses/{id}")
    public ApiResponse<AddressDto> updateAddress(
            @PathVariable Long id,
            @Valid @RequestBody UpsertAddressRequest request
    ) {
        return ApiResponse.ok(profileService.updateAddress(SecurityUtils.requirePrincipal().getId(), id, request));
    }

    @DeleteMapping("/me/addresses/{id}")
    public ApiResponse<Void> deleteAddress(@PathVariable Long id) {
        profileService.deleteAddress(SecurityUtils.requirePrincipal().getId(), id);
        return ApiResponse.ok("OK");
    }
}
