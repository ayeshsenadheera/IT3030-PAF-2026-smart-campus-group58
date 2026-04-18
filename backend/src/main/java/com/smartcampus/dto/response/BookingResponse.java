package com.smartcampus.dto.response;

import com.smartcampus.enums.BookingStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class BookingResponse {
    private Long id;
    private ResourceResponse resource;
    private UserResponse requester;
    private UserResponse approvedBy;
    private String title;
    private String purpose;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer attendees;
    private BookingStatus status;
    private String adminNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
