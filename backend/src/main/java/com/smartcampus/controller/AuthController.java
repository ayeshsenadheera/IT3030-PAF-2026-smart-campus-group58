package com.smartcampus.controller;

import com.smartcampus.dto.request.ForgotPasswordRequest;
import com.smartcampus.dto.request.LoginRequest;
import com.smartcampus.dto.request.RegisterRequest;
import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.dto.response.AuthResponse;
import com.smartcampus.dto.response.UserResponse;
import com.smartcampus.security.UserPrincipal;
import com.smartcampus.service.AuthService;
import com.smartcampus.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthService authService;

    /** Returns the currently authenticated user's profile. */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMe(
            @AuthenticationPrincipal UserPrincipal principal) {
        UserResponse user = userService.getMe(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    /** Email + password login */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest req) {
        AuthResponse resp = authService.login(req);
        return ResponseEntity.ok(ApiResponse.success("Login successful", resp));
    }

    /** Email + password registration */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest req) {
        AuthResponse resp = authService.register(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account created successfully", resp));
    }

    /** Forgot password — sends reset link to email */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest req) {
        authService.forgotPassword(req.getEmail());
        return ResponseEntity.ok(ApiResponse.success(
                "If an account exists with that email, a reset link has been sent.", null));
    }

    /** Reset password using token from email */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @RequestParam String token,
            @RequestBody ResetPasswordBody body) {
        authService.resetPassword(token, body.password());
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully.", null));
    }

    record ResetPasswordBody(
        @NotBlank @Size(min = 8) String password
    ) {}
}


