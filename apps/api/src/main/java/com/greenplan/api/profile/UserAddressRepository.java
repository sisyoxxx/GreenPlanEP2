package com.greenplan.api.profile;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {
    List<UserAddress> findByUserIdOrderByIsDefaultDescIdDesc(Long userId);
    List<UserAddress> findAllByUserId(Long userId);
}

