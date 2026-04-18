package com.smartcampus.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentUpdateRequest {
    @NotBlank(message = "Comment body is required")
    private String body;
}
