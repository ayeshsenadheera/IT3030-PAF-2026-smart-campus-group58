package com.smartcampus.dto.response;

import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class ResourceResponse {
    private Long id;
    private String name;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private String description;
    private String availabilityWindows;
    private ResourceStatus status;
    private String imageUrl;
    private UserResponse createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
