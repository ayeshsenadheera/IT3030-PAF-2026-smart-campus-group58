package com.smartcampus.dto.request;

public class ResourceRequest {
    
    @NotBlank(message = "Resource name is required")
    private String name;
}
