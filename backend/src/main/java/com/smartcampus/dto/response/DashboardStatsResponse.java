package com.smartcampus.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class DashboardStatsResponse {
    private long totalResources;
    private long availableResources;
    private long pendingBookings;
    private long approvedBookings;
    private long openTickets;
    private long inProgressTickets;
    private long resolvedTickets;
    private long totalUsers;
    private long unreadNotifications;
}
