package com.greenplan.api.auth;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class UserDataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserDataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.count() > 0) {
            return;
        }

        seedUser("buyer", "123456", RoleCode.BUYER);
        seedUser("admin", "123456", RoleCode.ADMIN);
        seedUser("stockadmin", "123456", RoleCode.INVENTORY_MANAGER);
    }

    private void seedUser(String username, String rawPassword, RoleCode roleCode) {
        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRoleCode(roleCode);
        userRepository.save(user);
    }
}
