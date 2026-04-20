package com.smartcampus.controller;

import com.smartcampus.dto.request.BookingActionRequest;
import com.smartcampus.dto.request.BookingRequest;
import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.dto.response.BookingResponse;
import com.smartcampus.dto.response.PagedResponse;
import com.smartcampus.enums.BookingStatus;
import com.smartcampus.security.UserPrincipal;
import com.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<BookingResponse>> create(
            @Valid @RequestBody BookingRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        BookingResponse created = bookingService.create(req, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking submitted successfully", created));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<BookingResponse>>> getAll(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) Long requesterId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<BookingResponse> result = bookingService.getAll(
                status, requesterId, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(result));
    }


    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<PagedResponse<BookingResponse>>> getMyBookings(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<BookingResponse> result = bookingService.getMyBookings(
                principal.getId(), PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<BookingResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getById(id)));
    }

    @PutMapping("/{id}/action")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponse>> processAction(
            @PathVariable Long id,
            @Valid @RequestBody BookingActionRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        BookingResponse result = bookingService.processAction(id, req, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Booking " + req.getStatus().name().toLowerCase(), result));
    }

    /**
     * Returns available 1-hour slots for a resource on a given date.
     * Slots: 07:00 - 22:00 (1-hour each), booked ones excluded.
     * GET /api/bookings/available-slots?resourceId=1&date=2026-04-20
     */
    @GetMapping("/available-slots")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAvailableSlots(
            @RequestParam Long resourceId,
            @RequestParam String date) {
        List<Map<String, Object>> slots = bookingService.getAvailableSlots(resourceId, date);
        return ResponseEntity.ok(ApiResponse.success(slots));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<BookingResponse>> cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        BookingResponse result = bookingService.cancel(id, principal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled", result));
    }
}
