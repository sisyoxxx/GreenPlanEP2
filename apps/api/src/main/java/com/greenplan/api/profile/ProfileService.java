package com.greenplan.api.profile;

import com.greenplan.api.auth.User;
import com.greenplan.api.auth.UserRepository;
import com.greenplan.api.common.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final UserAddressRepository userAddressRepository;

    public ProfileService(UserRepository userRepository, UserAddressRepository userAddressRepository) {
        this.userRepository = userRepository;
        this.userAddressRepository = userAddressRepository;
    }

    public MyProfileDto getMyProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return toDto(user);
    }

    @Transactional
    public MyProfileDto updateMyProfile(Long userId, UpdateMyProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String nextUsername = StringUtils.normalizeBlankToNull(request.username());
        if (nextUsername != null) {
            if (nextUsername.length() > 64) {
                throw new IllegalArgumentException("Username must be at most 64 characters");
            }
            String currentUsername = user.getUsername();
            if (!nextUsername.equals(currentUsername) && userRepository.existsByUsername(nextUsername)) {
                throw new IllegalArgumentException("Username already exists");
            }
            user.setUsername(nextUsername);
        }

        user.setNickname(StringUtils.normalizeBlankToNull(request.nickname()));
        user.setGender(StringUtils.normalizeBlankToNull(request.gender()));
        user.setPhone(StringUtils.normalizeBlankToNull(request.phone()));
        user.setAvatarDataUrl(StringUtils.normalizeBlankToNull(request.avatarDataUrl()));

        return toDto(userRepository.save(user));
    }

    public List<AddressDto> listAddresses(Long userId) {
        return userAddressRepository.findByUserIdOrderByIsDefaultDescIdDesc(userId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public AddressDto createAddress(Long userId, UpsertAddressRequest request) {
        UserAddress address = new UserAddress();
        address.setUserId(userId);
        address.setAddressText(request.addressText().trim());
        address.setDefault(Boolean.TRUE.equals(request.isDefault()));

        UserAddress saved = userAddressRepository.save(address);

        if (saved.isDefault()) {
            applyDefault(userId, saved.getId());
        }

        return toDto(saved);
    }

    @Transactional
    public AddressDto updateAddress(Long userId, Long addressId, UpsertAddressRequest request) {
        UserAddress address = userAddressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("Address not found"));
        if (!address.getUserId().equals(userId)) {
            throw new IllegalArgumentException("No permission to update this address");
        }

        address.setAddressText(request.addressText().trim());
        address.setDefault(Boolean.TRUE.equals(request.isDefault()));
        UserAddress saved = userAddressRepository.save(address);

        if (saved.isDefault()) {
            applyDefault(userId, saved.getId());
        }

        return toDto(saved);
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        UserAddress address = userAddressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("Address not found"));
        if (!address.getUserId().equals(userId)) {
            throw new IllegalArgumentException("No permission to delete this address");
        }
        userAddressRepository.delete(address);
    }

    private void applyDefault(Long userId, Long keepDefaultId) {
        List<UserAddress> all = userAddressRepository.findAllByUserId(userId);
        if (all.isEmpty()) {
            return;
        }

        List<UserAddress> changed = new ArrayList<>();
        for (UserAddress entry : all) {
            boolean shouldDefault = entry.getId().equals(keepDefaultId);
            if (entry.isDefault() != shouldDefault) {
                entry.setDefault(shouldDefault);
                changed.add(entry);
            }
        }
        if (!changed.isEmpty()) {
            userAddressRepository.saveAll(changed);
        }
    }

    private MyProfileDto toDto(User user) {
        return new MyProfileDto(
                user.getId(),
                user.getUsername(),
                user.getRoleCode(),
                user.getNickname(),
                user.getGender(),
                user.getPhone(),
                user.getAvatarDataUrl()
        );
    }

    private AddressDto toDto(UserAddress address) {
        return new AddressDto(
                address.getId(),
                address.getUserId(),
                address.getAddressText(),
                address.isDefault(),
                address.getCreatedAt(),
                address.getUpdatedAt()
        );
    }
}
