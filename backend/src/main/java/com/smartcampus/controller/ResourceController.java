package com.smartcampus.controller;

import com.smartcampus.dto.request.ResourceRequest;
import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.dto.response.PagedResponse;
import com.smartcampus.dto.response.ResourceResponse;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import com.smartcampus.security.UserPrincipal;
import com.smartcampus.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ResourceResponse>>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

        PagedResponse<ResourceResponse> result =
                resourceService.search(keyword, type, status, PageRequest.of(page, size, sort));

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(resourceService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ResourceResponse>> create(
            @Valid @RequestBody ResourceRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        ResourceResponse created = resourceService.create(req, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Resource created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ResourceResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ResourceRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Resource updated", resourceService.update(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        resourceService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Resource deleted", null));
    }
}
