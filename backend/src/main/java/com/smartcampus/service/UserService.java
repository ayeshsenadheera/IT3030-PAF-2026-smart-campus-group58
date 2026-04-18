package com.smartcampus.service;

import com.smartcampus.dto.response.DashboardStatsResponse;
import com.smartcampus.dto.response.UserResponse;
import com.smartcampus.entity.Role;
import com.smartcampus.entity.User;
import com.smartcampus.enums.BookingStatus;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.RoleName;
import com.smartcampus.enums.TicketStatus;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository      userRepository;
    private final RoleRepository      roleRepository;
    private final BookingRepository   bookingRepository;
    private final TicketRepository    ticketRepository;
    private final ResourceRepository  resourceRepository;
    private final NotificationService notificationService;

    @Value("${app.super-admin.email}")
    private String superAdminEmail;

    @Transactional(readOnly = true)
    public UserResponse getMe(@NonNull Long userId) {
        return toResponse(findOrThrow(userId));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers(@NonNull Pageable pageable) {
        Page<User> page = userRepository.findAll(pageable);
        return page.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getTechnicians() {
        Role techRole = roleRepository.findByName(RoleName.TECHNICIAN)
                .orElseThrow(() -> new ResourceNotFoundException("TECHNICIAN role not found"));
        return userRepository.findAll().stream()
                .filter(u -> u.getRoles().contains(techRole))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse assignRole(@NonNull Long userId, @NonNull RoleName roleName) {
        User user = findOrThrow(userId);
        guardSuperAdmin(user, "assign roles to");
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
        user.getRoles().add(role);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse removeRole(@NonNull Long userId, @NonNull RoleName roleName) {
        User user = findOrThrow(userId);
        guardSuperAdmin(user, "remove roles from");
        user.getRoles().removeIf(r -> r.getName() == roleName);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse toggleActive(@NonNull Long userId) {
        User user = findOrThrow(userId);
        guardSuperAdmin(user, "deactivate");
        user.setIsActive(!Objects.requireNonNull(user.getIsActive(), "isActive cannot be null"));
        return toResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(@NonNull Long userId) {
        long unread          = notificationService.countUnread(userId);
        long totalResources  = resourceRepository.count();
        long availableRes    = resourceRepository.search(null, null, ResourceStatus.ACTIVE, Pageable.unpaged()).getTotalElements();
        long pendingBookings = bookingRepository.findByStatus(BookingStatus.PENDING,  Pageable.unpaged()).getTotalElements();
        long approvedBk      = bookingRepository.findByStatus(BookingStatus.APPROVED, Pageable.unpaged()).getTotalElements();
        long openTickets     = ticketRepository.countByStatus(TicketStatus.OPEN);
        long inProgress      = ticketRepository.countByStatus(TicketStatus.IN_PROGRESS);
        long resolved        = ticketRepository.countByStatus(TicketStatus.RESOLVED);
        long totalUsers      = userRepository.count();

        return DashboardStatsResponse.builder()
                .totalResources(totalResources)
                .availableResources(availableRes)
                .pendingBookings(pendingBookings)
                .approvedBookings(approvedBk)
                .openTickets(openTickets)
                .inProgressTickets(inProgress)
                .resolvedTickets(resolved)
                .totalUsers(totalUsers)
                .unreadNotifications(unread)
                .build();
    }

    /** Throw if someone tries to modify the super-admin account. */
    private void guardSuperAdmin(@NonNull User user, String action) {
        if (superAdminEmail.equalsIgnoreCase(user.getEmail())) {
            throw new BadRequestException(
                    "Cannot " + action + " the super admin account.");
        }
    }

    private User findOrThrow(@NonNull Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    public UserResponse toResponse(@NonNull User u) {
        return UserResponse.builder()
                .id(u.getId())
                .email(u.getEmail())
                .fullName(u.getFullName())
                .avatarUrl(u.getAvatarUrl())
                .phone(u.getPhone())
                .department(u.getDepartment())
                .roles(u.getRoles().stream()
                        .map(r -> r.getName().name())
                        .collect(Collectors.toSet()))
                .isActive(u.getIsActive())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
