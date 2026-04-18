package com.smartcampus.controller;

import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.dto.response.UserResponse;
import com.smartcampus.enums.RoleName;
import com.smartcampus.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.getAllUsers(PageRequest.of(page, size))));
    }

    @GetMapping("/technicians")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getTechnicians() {
        return ResponseEntity.ok(ApiResponse.success(userService.getTechnicians()));
    }

    @PutMapping("/users/{userId}/roles/{roleName}")
    public ResponseEntity<ApiResponse<UserResponse>> assignRole(
            @PathVariable Long userId,
            @PathVariable RoleName roleName) {
        return ResponseEntity.ok(
                ApiResponse.success("Role assigned", userService.assignRole(userId, roleName)));
    }

    @DeleteMapping("/users/{userId}/roles/{roleName}")
    public ResponseEntity<ApiResponse<UserResponse>> removeRole(
            @PathVariable Long userId,
            @PathVariable RoleName roleName) {
        return ResponseEntity.ok(
                ApiResponse.success("Role removed", userService.removeRole(userId, roleName)));
    }

    @PatchMapping("/users/{userId}/toggle-active")
    public ResponseEntity<ApiResponse<UserResponse>> toggleActive(@PathVariable Long userId) {
        return ResponseEntity.ok(
                ApiResponse.success("User status toggled", userService.toggleActive(userId)));
    }
}
