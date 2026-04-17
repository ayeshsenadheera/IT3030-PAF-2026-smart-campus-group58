package com.smartcampus.service;

import com.smartcampus.dto.request.CommentRequest;
import com.smartcampus.dto.request.TicketRequest;
import com.smartcampus.dto.request.TicketUpdateRequest;
import com.smartcampus.dto.response.TicketResponse;
import com.smartcampus.entity.Comment;
import com.smartcampus.entity.Ticket;
import com.smartcampus.entity.User;
import com.smartcampus.enums.TicketCategory;
import com.smartcampus.enums.TicketPriority;
import com.smartcampus.enums.TicketStatus;
import com.smartcampus.exception.AccessDeniedException;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.repository.CommentRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TicketService Unit Tests")
class TicketServiceTest {

    @Mock private TicketRepository    ticketRepository;
    @Mock private CommentRepository   commentRepository;
    @Mock private UserRepository      userRepository;
    @Mock private ResourceRepository  resourceRepository;
    @Mock private NotificationService notificationService;
    @Mock private ResourceService     resourceService;

    @InjectMocks
    private TicketService ticketService;

    private User   creator;
    private Ticket ticket;

    @BeforeEach
    void setUp() {
        creator = User.builder()
                .id(1L).email("student@sliit.lk").fullName("Test Student").build();

        ticket = Ticket.builder()
                .id(20L).createdBy(creator)
                .title("Projector not working").description("Room 301 projector is broken, screen flickers.")
                .category(TicketCategory.IT).priority(TicketPriority.HIGH)
                .status(TicketStatus.OPEN).build();
    }

    @Test
    @DisplayName("Should create ticket with OPEN status by default")
    void create_shouldSetOpenStatus() {
        TicketRequest req = new TicketRequest();
        req.setTitle("AC not working");
        req.setDescription("The air conditioning in Lab B102 stopped working since morning.");
        req.setCategory(TicketCategory.MAINTENANCE);
        req.setPriority(TicketPriority.MEDIUM);

        Ticket saved = Ticket.builder()
                .id(21L).createdBy(creator)
                .title(req.getTitle()).description(req.getDescription())
                .category(req.getCategory()).priority(req.getPriority())
                .status(TicketStatus.OPEN).build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(creator));
        when(ticketRepository.save(any(Ticket.class))).thenReturn(saved);

        TicketResponse response = ticketService.create(req, 1L);

        assertThat(response.getStatus()).isEqualTo(TicketStatus.OPEN);
        verify(notificationService, times(1)).send(anyLong(), any(), anyString(), anyString(), anyString(), anyLong());
    }

    @Test
    @DisplayName("Should throw BadRequestException on invalid status transition")
    void update_shouldThrow_whenInvalidTransition() {
        // OPEN → CLOSED is invalid (must go OPEN → IN_PROGRESS → RESOLVED → CLOSED)
        ticket.setStatus(TicketStatus.OPEN);
        when(ticketRepository.findById(20L)).thenReturn(Optional.of(ticket));

        TicketUpdateRequest req = new TicketUpdateRequest();
        req.setStatus(TicketStatus.CLOSED);

        assertThatThrownBy(() -> ticketService.update(20L, req, 99L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid status transition");
    }

    @Test
    @DisplayName("Should allow OPEN → IN_PROGRESS transition")
    void update_shouldSucceed_forValidTransition() {
        ticket.setStatus(TicketStatus.OPEN);

        Ticket updated = Ticket.builder()
                .id(20L).createdBy(creator)
                .title(ticket.getTitle()).description(ticket.getDescription())
                .category(ticket.getCategory()).priority(ticket.getPriority())
                .status(TicketStatus.IN_PROGRESS).build();

        when(ticketRepository.findById(20L)).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(any())).thenReturn(updated);

        TicketUpdateRequest req = new TicketUpdateRequest();
        req.setStatus(TicketStatus.IN_PROGRESS);

        TicketResponse response = ticketService.update(20L, req, 99L);

        assertThat(response.getStatus()).isEqualTo(TicketStatus.IN_PROGRESS);
    }

    @Test
    @DisplayName("Should throw AccessDeniedException when deleting another user's comment")
    void deleteComment_shouldThrow_whenNotOwnerAndNotAdmin() {
        User otherUser = User.builder().id(99L).email("other@sliit.lk").fullName("Other").build();
        Comment comment = Comment.builder()
                .id(50L).ticket(ticket).author(otherUser).body("Some comment").build();

        when(commentRepository.findById(50L)).thenReturn(Optional.of(comment));

        // User 1L tries to delete comment owned by 99L, not admin
        assertThatThrownBy(() -> ticketService.deleteComment(50L, 1L, false))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("Admin should be able to delete any comment")
    void deleteComment_shouldSucceed_forAdmin() {
        User otherUser = User.builder().id(99L).email("other@sliit.lk").fullName("Other").build();
        Comment comment = Comment.builder()
                .id(50L).ticket(ticket).author(otherUser).body("Some comment").build();

        when(commentRepository.findById(50L)).thenReturn(Optional.of(comment));
        doNothing().when(commentRepository).delete(comment);

        assertThatCode(() -> ticketService.deleteComment(50L, 1L, true))
                .doesNotThrowAnyException();

        verify(commentRepository, times(1)).delete(comment);
    }

    @Test
    @DisplayName("Should reject adding more than 3 images to a ticket")
    void addImages_shouldThrow_whenExceedsThreeImages() {
        // Ticket already has 3 images
        ticket.getImages().add(com.smartcampus.entity.TicketImage.builder().imageUrl("url1").build());
        ticket.getImages().add(com.smartcampus.entity.TicketImage.builder().imageUrl("url2").build());
        ticket.getImages().add(com.smartcampus.entity.TicketImage.builder().imageUrl("url3").build());

        when(ticketRepository.findById(20L)).thenReturn(Optional.of(ticket));

        assertThatThrownBy(() -> ticketService.addImages(20L, java.util.List.of("url4"), 1L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Maximum 3 images");
    }
}
