package com.smartcampus.service;

import com.smartcampus.dto.response.AnalyticsResponse;
import com.smartcampus.entity.Ticket;
import com.smartcampus.enums.TicketStatus;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final BookingRepository bookingRepository;
    private final TicketRepository  ticketRepository;

    @Transactional(readOnly = true)
    public AnalyticsResponse getAnalytics() {

        // ── Top 5 Resources ─────────────────────────────
        List<AnalyticsResponse.ResourceStat> topResources = new ArrayList<>();
        try {
            List<Object[]> raw = bookingRepository.findTopResources();
            for (Object[] row : raw) {
                topResources.add(AnalyticsResponse.ResourceStat.builder()
                        .name((String) row[0])
                        .bookingCount(((Number) row[1]).longValue())
                        .build());
            }
        } catch (Exception e) {
            log.warn("Could not fetch top resources: {}", e.getMessage());
        }

        // ── Bookings by Hour ─────────────────────────────
        Map<Integer, Long> byHour = new LinkedHashMap<>();
        for (int h = 0; h < 24; h++) byHour.put(h, 0L);
        Integer peakHour = null;
        long    peakVal  = 0;
        try {
            List<Object[]> raw = bookingRepository.findBookingsByHour();
            for (Object[] row : raw) {
                int  hr  = ((Number) row[0]).intValue();
                long cnt = ((Number) row[1]).longValue();
                byHour.put(hr, cnt);
                if (cnt > peakVal) { peakVal = cnt; peakHour = hr; }
            }
        } catch (Exception e) {
            log.warn("Could not fetch hourly bookings: {}", e.getMessage());
        }

        // ── Daily Bookings (last 7 days) ─────────────────
        Map<String, Long> daily = new LinkedHashMap<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        try {
            LocalDateTime since = LocalDateTime.now().minusDays(7);
            List<Object[]> raw  = bookingRepository.findDailyBookingCounts(since);
            for (Object[] row : raw) {
                daily.put(String.valueOf(row[0]), ((Number) row[1]).longValue());
            }
        } catch (Exception e) {
            log.warn("Could not fetch daily bookings: {}", e.getMessage());
        }

        // ── Service Level Timers ─────────────────────────
        // Time-to-first-response: createdAt → first IN_PROGRESS or RESOLVED
        // Time-to-resolution:     createdAt → resolvedAt
        double avgFirstResponse = 0;
        double avgResolution    = 0;
        try {
            List<Ticket> resolved = ticketRepository
                    .findAll().stream()
                    .filter(t -> t.getStatus() == TicketStatus.RESOLVED
                              || t.getStatus() == TicketStatus.CLOSED)
                    .collect(Collectors.toList());

            if (!resolved.isEmpty()) {
                // Resolution time (hours) from createdAt → resolvedAt
                OptionalDouble res = resolved.stream()
                        .filter(t -> t.getResolvedAt() != null && t.getCreatedAt() != null)
                        .mapToLong(t -> java.time.Duration.between(
                                t.getCreatedAt(), t.getResolvedAt()).toHours())
                        .average();
                avgResolution = res.orElse(0);

                // First response = time from createdAt to updatedAt (first status change)
                OptionalDouble resp = resolved.stream()
                        .filter(t -> t.getUpdatedAt() != null && t.getCreatedAt() != null)
                        .mapToLong(t -> java.time.Duration.between(
                                t.getCreatedAt(), t.getUpdatedAt()).toHours())
                        .average();
                avgFirstResponse = resp.orElse(0);
            }
        } catch (Exception e) {
            log.warn("Could not calculate service level timers: {}", e.getMessage());
        }

        return AnalyticsResponse.builder()
                .topResources(topResources)
                .bookingsByHour(byHour)
                .peakHour(peakHour)
                .dailyBookings(daily)
                .avgTimeToFirstResponse(Math.round(avgFirstResponse * 10.0) / 10.0)
                .avgTimeToResolution(Math.round(avgResolution * 10.0) / 10.0)
                .build();
    }
}
