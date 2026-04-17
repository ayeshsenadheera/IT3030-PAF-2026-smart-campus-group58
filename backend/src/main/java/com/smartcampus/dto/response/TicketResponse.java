package com.smartcampus.dto.response;

import com.smartcampus.enums.TicketCategory;
import com.smartcampus.enums.TicketPriority;
import com.smartcampus.enums.TicketStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class TicketResponse {
    private Long id;
    private UserResponse createdBy;
    private UserResponse assignedTo;
    private ResourceResponse resource;
    private String title;
    private String description;
    private TicketCategory category;
    private TicketPriority priority;
    private TicketStatus status;
    private String preferredContact;
    private String resolutionNotes;
    private List<String> imageUrls;
    private List<CommentResponse> comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
}
