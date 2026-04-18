package com.smartcampus.controller;

import com.smartcampus.dto.response.AnalyticsResponse;
import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.dto.response.DashboardStatsResponse;
import com.smartcampus.entity.NotificationPreference;
import com.smartcampus.entity.User;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.NotificationPreferenceRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.UserPrincipal;
import com.smartcampus.service.AnalyticsService;
import com.smartcampus.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Transactional
public class DashboardController {

    private final UserService                      userService;
    private final AnalyticsService                 analyticsService;
    private final NotificationPreferenceRepository prefRepository;
    private final UserRepository                   userRepository;

    @GetMapping("/stats")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getStats(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.getDashboardStats(principal.getId())));
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getAnalytics()));
    }

    @GetMapping("/notification-preferences")
    public ResponseEntity<ApiResponse<NotificationPreference>> getPreferences(
            @AuthenticationPrincipal UserPrincipal principal) {
        NotificationPreference pref = getOrCreatePrefs(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(pref));
    }

    @PutMapping("/notification-preferences")
    public ResponseEntity<ApiResponse<NotificationPreference>> updatePreferences(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, Boolean> updates) {

        NotificationPreference pref = getOrCreatePrefs(principal.getId());

        if (updates.containsKey("bookingUpdates")) pref.setBookingUpdates(updates.get("bookingUpdates"));
        if (updates.containsKey("ticketUpdates"))  pref.setTicketUpdates(updates.get("ticketUpdates"));
        if (updates.containsKey("commentAlerts"))  pref.setCommentAlerts(updates.get("commentAlerts"));
        if (updates.containsKey("assignments"))    pref.setAssignments(updates.get("assignments"));
        if (updates.containsKey("systemAlerts"))   pref.setSystemAlerts(updates.get("systemAlerts"));

        NotificationPreference saved = prefRepository.save(pref);
        return ResponseEntity.ok(ApiResponse.success("Preferences updated", saved));
    }

    // package-private so Spring @Transactional proxy can intercept it
    NotificationPreference getOrCreatePrefs(Long userId) {
        return prefRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", userId));
            return prefRepository.save(
                    NotificationPreference.builder().user(user).build());
        });
    }
}
