package com.smartcampus.controller;

import com.smartcampus.dto.request.CommentRequest;
import com.smartcampus.dto.request.CommentUpdateRequest;
import com.smartcampus.dto.request.TicketRequest;
import com.smartcampus.dto.request.TicketUpdateRequest;
import com.smartcampus.dto.response.*;
import com.smartcampus.enums.TicketCategory;
import com.smartcampus.enums.TicketPriority;
import com.smartcampus.enums.TicketStatus;
import com.smartcampus.security.UserPrincipal;
import com.smartcampus.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    public ResponseEntity<ApiResponse<TicketResponse>> create(
            @Valid @RequestBody TicketRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        TicketResponse created = ticketService.create(req, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Ticket created successfully", created));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<PagedResponse<TicketResponse>>> search(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) TicketCategory category,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<TicketResponse> result = ticketService.search(
                status, priority, category, keyword,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<PagedResponse<TicketResponse>>> getMyTickets(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<TicketResponse> result = ticketService.getMyTickets(
                principal.getId(), PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/assigned")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<PagedResponse<TicketResponse>>> getAssignedTickets(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<TicketResponse> result = ticketService.getAssignedTickets(
                principal.getId(), PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketResponse>> getById(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean includeComments) {
        return ResponseEntity.ok(ApiResponse.success(ticketService.getById(id, includeComments)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<TicketResponse>> update(
            @PathVariable Long id,
            @RequestBody TicketUpdateRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        TicketResponse updated = ticketService.update(id, req, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Ticket updated", updated));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdminOrTech = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")
                            || a.getAuthority().equals("ROLE_TECHNICIAN"));
        CommentResponse comment = ticketService.addComment(id, req, principal.getId(), isAdminOrTech);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comment added", comment));
    }

    @PatchMapping("/comments/{commentId}")
    public ResponseEntity<ApiResponse<CommentResponse>> editComment(
            @PathVariable Long commentId,
            @Valid @RequestBody CommentUpdateRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        CommentResponse updated = ticketService.editComment(
                commentId, req.getBody(), principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Comment updated", updated));
    }


    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        ticketService.deleteComment(commentId, principal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Comment deleted", null));
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<ApiResponse<TicketResponse>> addImages(
            @PathVariable Long id,
            @RequestBody List<String> imageUrls,
            @AuthenticationPrincipal UserPrincipal principal) {
        TicketResponse updated = ticketService.addImages(id, imageUrls, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Images added", updated));
    }
}
