package com.smartcampus.dto.request;

import com.smartcampus.enums.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingActionRequest {

    @NotNull(message = "Action status is required")
    private BookingStatus status;   // APPROVED | REJECTED | CANCELLED

    private String adminNotes;
}
