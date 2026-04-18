package com.smartcampus.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data @Builder
public class UserResponse {
    private Long id;
    private String email;
    private String fullName;
    private String avatarUrl;
    private String phone;
    private String department;
    private Set<String> roles;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
