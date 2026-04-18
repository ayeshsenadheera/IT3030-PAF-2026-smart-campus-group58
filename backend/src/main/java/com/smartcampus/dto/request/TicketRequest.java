package com.smartcampus.dto.request;

import com.smartcampus.enums.TicketCategory;
import com.smartcampus.enums.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Category is required")
    private TicketCategory category;

    private TicketPriority priority = TicketPriority.MEDIUM;

    private Long resourceId;

    /** Preferred contact details for follow-up (phone, office, etc.) */
    private String preferredContact;
}
