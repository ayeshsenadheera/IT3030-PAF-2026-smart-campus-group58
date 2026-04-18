package com.smartcampus.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data @Builder
public class AnalyticsResponse {

    /** Top 5 most booked resources */
    private List<ResourceStat> topResources;

    /** Bookings by hour of day (0-23) */
    private Map<Integer, Long> bookingsByHour;

    /** Peak hour (0-23) */
    private Integer peakHour;

    /** Daily booking counts last 7 days */
    private Map<String, Long> dailyBookings;

    /** Average time to first response on tickets (hours) */
    private Double avgTimeToFirstResponse;

    /** Average time to resolution on tickets (hours) */
    private Double avgTimeToResolution;

    @Data @Builder
    public static class ResourceStat {
        private String name;
        private Long   bookingCount;
    }
}