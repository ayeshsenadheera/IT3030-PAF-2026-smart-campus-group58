package com.smartcampus.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.dto.response.PagedResponse;
import com.smartcampus.dto.response.ResourceResponse;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import com.smartcampus.security.CustomUserDetailsService;
import com.smartcampus.security.JwtTokenProvider;
import com.smartcampus.service.ResourceService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = ResourceController.class,
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                SecurityFilterAutoConfiguration.class,
                OAuth2ClientAutoConfiguration.class
        }
)
@DisplayName("ResourceController Integration Tests")
@ActiveProfiles("test")
class ResourceControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean ResourceService resourceService;
    @MockBean JwtTokenProvider jwtTokenProvider;
    @MockBean CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("GET /api/resources should return 200 with paged resources")
    @WithMockUser
    void searchResources_shouldReturn200() throws Exception {
        ResourceResponse res = ResourceResponse.builder()
                .id(1L).name("Lecture Hall A").type(ResourceType.ROOM)
                .capacity(200).location("Block A").status(ResourceStatus.ACTIVE).build();

        PagedResponse<ResourceResponse> paged = PagedResponse.<ResourceResponse>builder()
                .content(List.of(res)).page(0).size(10).totalElements(1).totalPages(1).last(true).build();

        when(resourceService.search(any(), any(), any(), any(Pageable.class))).thenReturn(paged);

        mockMvc.perform(get("/api/resources").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].name").value("Lecture Hall A"))
                .andExpect(jsonPath("$.data.content[0].status").value("ACTIVE"));
    }

    @Test
    @DisplayName("GET /api/resources/{id} should return 200 for existing resource")
    @WithMockUser
    void getById_shouldReturn200_whenExists() throws Exception {
        ResourceResponse res = ResourceResponse.builder()
                .id(5L).name("Computer Lab 01").type(ResourceType.LAB)
                .capacity(40).location("Block B").status(ResourceStatus.ACTIVE).build();

        when(resourceService.getById(5L)).thenReturn(res);

        mockMvc.perform(get("/api/resources/5").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(5))
                .andExpect(jsonPath("$.data.type").value("LAB"));
    }
}
