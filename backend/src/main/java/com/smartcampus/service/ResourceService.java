package com.smartcampus.service;

import com.smartcampus.dto.request.ResourceRequest;
import com.smartcampus.dto.response.PagedResponse;
import com.smartcampus.dto.response.ResourceResponse;
import com.smartcampus.dto.response.UserResponse;
import com.smartcampus.entity.Resource;
import com.smartcampus.entity.User;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final UserRepository     userRepository;

    @Transactional(readOnly = true)
    public PagedResponse<ResourceResponse> search(String keyword,
                                                   ResourceType type,
                                                   ResourceStatus status,
                                                   @NonNull Pageable pageable) {
        Page<ResourceResponse> page = resourceRepository
                .search(keyword, type, status, pageable)
                .map(this::toResponse);
        return PagedResponse.of(page);
    }

    @Transactional(readOnly = true)
    public ResourceResponse getById(@NonNull Long id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public ResourceResponse create(@NonNull ResourceRequest req, @NonNull Long adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", adminId));

        Resource resource = Resource.builder()
                .name(req.getName())
                .type(req.getType())
                .capacity(req.getCapacity())
                .location(req.getLocation())
                .description(req.getDescription())
                .status(req.getStatus() != null ? req.getStatus() : ResourceStatus.ACTIVE)
                .imageUrl(req.getImageUrl())
                .createdBy(admin)
                .build();

        return toResponse(resourceRepository.save(resource));
    }

    @Transactional
    public ResourceResponse update(@NonNull Long id, @NonNull ResourceRequest req) {
        Resource resource = findOrThrow(id);
        resource.setName(req.getName());
        resource.setType(req.getType());
        resource.setCapacity(req.getCapacity());
        resource.setLocation(req.getLocation());
        resource.setDescription(req.getDescription());
        resource.setAvailabilityWindows(req.getAvailabilityWindows());
        if (req.getStatus()   != null) resource.setStatus(req.getStatus());
        if (req.getImageUrl() != null) resource.setImageUrl(req.getImageUrl());
        return toResponse(resourceRepository.save(resource));
    }

    @Transactional
    public void delete(@NonNull Long id) {
        findOrThrow(id);
        resourceRepository.deleteById(id);
    }

    private Resource findOrThrow(@NonNull Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", id));
    }

    public ResourceResponse toResponse(@NonNull Resource r) {
        return ResourceResponse.builder()
                .id(r.getId())
                .name(r.getName())
                .type(r.getType())
                .capacity(r.getCapacity())
                .location(r.getLocation())
                .description(r.getDescription())
                .availabilityWindows(r.getAvailabilityWindows())
                .status(r.getStatus())
                .imageUrl(r.getImageUrl())
                .createdBy(toUserResponse(r.getCreatedBy()))
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }

    private UserResponse toUserResponse(User u) {
        if (u == null) return null;
        return UserResponse.builder()
                .id(u.getId())
                .email(u.getEmail())
                .fullName(u.getFullName())
                .avatarUrl(u.getAvatarUrl())
                .build();
    }
}
