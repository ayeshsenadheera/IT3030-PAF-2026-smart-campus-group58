package com.smartcampus.service;

import com.smartcampus.entity.Role;
import com.smartcampus.entity.User;
import com.smartcampus.enums.RoleName;
import com.smartcampus.repository.RoleRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class OAuth2UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Value("${app.super-admin.email}")
    private String superAdminEmail;

    @Transactional
    public User processOAuthUser(String googleId, String email, String name, String avatarUrl) {
        log.info("Processing OAuth user: email={}", email);

        // 1. Find by googleId
        Optional<User> byGoogleId = userRepository.findByGoogleId(googleId);
        if (byGoogleId.isPresent()) {
            User u = byGoogleId.get();
            u.setFullName(name != null ? name : u.getFullName());
            u.setAvatarUrl(avatarUrl);
            ensureSuperAdmin(u);
            log.info("Found user by googleId: {}", email);
            return userRepository.save(u);
        }

        // 2. Find by email
        Optional<User> byEmail = userRepository.findByEmail(email);
        if (byEmail.isPresent()) {
            User u = byEmail.get();
            u.setGoogleId(googleId);
            u.setFullName(name != null ? name : u.getFullName());
            u.setAvatarUrl(avatarUrl);
            ensureSuperAdmin(u);
            log.info("Linked googleId to existing email user: {}", email);
            return userRepository.save(u);
        }

        // 3. Create new user
        log.info("Creating new user for: {}", email);
        Role userRole = roleRepository.findByName(RoleName.USER)
                .orElseThrow(() -> new RuntimeException(
                        "USER role missing — run database/schema.sql first!"));

        Set<Role> roles = new HashSet<>();
        roles.add(userRole);

        User newUser = User.builder()
                .googleId(googleId)
                .email(email)
                .fullName(name != null ? name : email)
                .avatarUrl(avatarUrl)
                .isActive(true)
                .roles(roles)
                .build();

        ensureSuperAdmin(newUser);

        User saved = userRepository.save(newUser);
        log.info("New user created: id={}, email={}, roles={}", saved.getId(), saved.getEmail(), saved.getRoles());
        return saved;
    }

    /** If this is the super admin email, make sure ADMIN role is assigned. */
    private void ensureSuperAdmin(User user) {
        if (!superAdminEmail.equalsIgnoreCase(user.getEmail())) return;

        boolean alreadyAdmin = user.getRoles().stream()
                .anyMatch(r -> r.getName() == RoleName.ADMIN);
        if (alreadyAdmin) return;

        Role adminRole = roleRepository.findByName(RoleName.ADMIN)
                .orElseThrow(() -> new RuntimeException(
                        "ADMIN role missing — run database/schema.sql first!"));

        if (user.getRoles() == null) {
            user.setRoles(new HashSet<>());
        }
        user.getRoles().add(adminRole);
        log.info("Super admin role assigned to: {}", user.getEmail());
    }
}
