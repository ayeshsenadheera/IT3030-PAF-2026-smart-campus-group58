package com.smartcampus.dto.request;

import com.smartcampus.enums.ResourceType;

public class ResourceRequest {
    
    @NotBlank(message = "Resource name is required")
    private String name;

    @NotNull(message = "Resource type is required")
    private ResourceType type;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

}
