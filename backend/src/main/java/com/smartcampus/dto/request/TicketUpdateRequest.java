package com.smartcampus.dto.request;

import com.smartcampus.enums.TicketStatus;
import lombok.Data;

@Data
public class TicketUpdateRequest {
    private TicketStatus status;
    private Long assignedToId;
    private String resolutionNotes;
}
