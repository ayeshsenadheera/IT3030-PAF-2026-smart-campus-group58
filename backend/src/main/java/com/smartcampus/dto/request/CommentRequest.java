package com.smartcampus.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentRequest {

    @NotBlank(message = "Comment body is required")
    private String body;

    private Boolean isInternal = false;
}
