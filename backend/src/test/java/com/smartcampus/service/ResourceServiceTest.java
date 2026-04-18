package com.smartcampus.service;

import com.smartcampus.dto.request.ResourceRequest;
import com.smartcampus.dto.response.ResourceResponse;
import com.smartcampus.entity.Resource;
import com.smartcampus.entity.User;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ResourceService Unit Tests")
class ResourceServiceTest {

    @Mock private ResourceRepository resourceRepository;
    @Mock private UserRepository     userRepository;

    @InjectMocks
    private ResourceService resourceService;

    private User     admin;
    private Resource resource;

    @BeforeEach
    void setUp() {
        admin = User.builder()
                .id(1L).email("admin@sliit.lk").fullName("Admin User").build();

        resource = Resource.builder()
                .id(5L).name("Lecture Hall A").type(ResourceType.ROOM)
                .capacity(200).location("Block A, Floor 1")
                .status(ResourceStatus.ACTIVE).createdBy(admin).build();
    }

    @Test
    @DisplayName("Should return resource by ID")
    void getById_shouldReturnResource_whenExists() {
        when(resourceRepository.findById(5L)).thenReturn(Optional.of(resource));

        ResourceResponse response = resourceService.getById(5L);

        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("Lecture Hall A");
        assertThat(response.getType()).isEqualTo(ResourceType.ROOM);
        assertThat(response.getStatus()).isEqualTo(ResourceStatus.ACTIVE);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when resource not found")
    void getById_shouldThrow_whenNotFound() {
        when(resourceRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> resourceService.getById(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Should create resource with ACTIVE status by default")
    void create_shouldDefaultToActiveStatus() {
        ResourceRequest req = new ResourceRequest();
        req.setName("Computer Lab 01");
        req.setType(ResourceType.LAB);
        req.setCapacity(40);
        req.setLocation("Block B, Floor 2");
        req.setDescription("High-performance lab");
        req.setAvailabilityWindows("Mon-Fri 08:00-20:00");
        // status not set — should default to ACTIVE

        Resource savedResource = Resource.builder()
                .id(6L).name(req.getName()).type(req.getType())
                .capacity(req.getCapacity()).location(req.getLocation())
                .status(ResourceStatus.ACTIVE).createdBy(admin).build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(resourceRepository.save(any(Resource.class))).thenReturn(savedResource);

        ResourceResponse response = resourceService.create(req, 1L);

        assertThat(response.getStatus()).isEqualTo(ResourceStatus.ACTIVE);
        verify(resourceRepository, times(1)).save(any(Resource.class));
    }

    @Test
    @DisplayName("Should delete resource successfully")
    void delete_shouldCallRepository_whenExists() {
        when(resourceRepository.findById(5L)).thenReturn(Optional.of(resource));
        doNothing().when(resourceRepository).deleteById(5L);

        assertThatCode(() -> resourceService.delete(5L)).doesNotThrowAnyException();
        verify(resourceRepository, times(1)).deleteById(5L);
    }

    @Test
    @DisplayName("Should search resources and return paged result")
    void search_shouldReturnPagedResults() {
        Page<Resource> page = new PageImpl<>(List.of(resource));
        when(resourceRepository.search(any(), any(), any(), any())).thenReturn(page);

        var result = resourceService.search("Lab", null, ResourceStatus.ACTIVE, PageRequest.of(0, 10));

        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(1);
    }
}
