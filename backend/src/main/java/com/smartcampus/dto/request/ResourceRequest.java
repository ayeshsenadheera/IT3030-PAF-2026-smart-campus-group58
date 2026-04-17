package com.smartcampus.dto.request;

import com.smartcampus.enums.ResourceType;

public class ResourceRequest {
    
    @NotBlank(message = "Resource name is required")
    private String name;

    @NotNull(message = "Resource type is required")
    private ResourceType type;
}
