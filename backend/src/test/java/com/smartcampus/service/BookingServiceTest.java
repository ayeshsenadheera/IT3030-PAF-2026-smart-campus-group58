package com.smartcampus.service;

import com.smartcampus.dto.request.BookingActionRequest;
import com.smartcampus.dto.request.BookingRequest;
import com.smartcampus.dto.response.BookingResponse;
import com.smartcampus.entity.Booking;
import com.smartcampus.entity.Resource;
import com.smartcampus.entity.User;
import com.smartcampus.enums.BookingStatus;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ConflictException;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BookingService Unit Tests")
class BookingServiceTest {

    @Mock private BookingRepository   bookingRepository;
    @Mock private ResourceRepository  resourceRepository;
    @Mock private UserRepository      userRepository;
    @Mock private NotificationService notificationService;
    @Mock private ResourceService     resourceService;

    @InjectMocks
    private BookingService bookingService;

    private User      testUser;
    private Resource  testResource;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L).email("test@sliit.lk").fullName("Test User").build();

        testResource = Resource.builder()
                .id(10L).name("Lab A101").type(ResourceType.LAB)
                .location("Block A").status(ResourceStatus.ACTIVE).build();
    }

    /* ── create booking ─────────────────────────────────────── */

    @Test
    @DisplayName("Should throw BadRequestException when end time is before start time")
    void create_shouldThrow_whenEndTimeBeforeStart() {
        BookingRequest req = new BookingRequest();
        req.setResourceId(10L);
        req.setTitle("Test Booking");
        req.setPurpose("Testing");
        req.setStartTime(LocalDateTime.now().plusHours(2));
        req.setEndTime(LocalDateTime.now().plusHours(1));   // end before start
        req.setAttendees(5);

        assertThatThrownBy(() -> bookingService.create(req, 1L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("End time must be after start time");
    }

    @Test
    @DisplayName("Should throw ConflictException when resource already booked")
    void create_shouldThrow_whenTimeConflict() {
        BookingRequest req = new BookingRequest();
        req.setResourceId(10L);
        req.setTitle("Lab Session");
        req.setPurpose("Practical");
        req.setStartTime(LocalDateTime.now().plusDays(1).withHour(9));
        req.setEndTime(LocalDateTime.now().plusDays(1).withHour(11));
        req.setAttendees(20);

        when(resourceRepository.findById(10L)).thenReturn(Optional.of(testResource));
        when(bookingRepository.hasConflict(eq(10L), any(), any(), isNull())).thenReturn(true);

        assertThatThrownBy(() -> bookingService.create(req, 1L))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already booked");
    }

    @Test
    @DisplayName("Should create booking successfully when no conflict")
    void create_shouldSucceed_whenNoConflict() {
        BookingRequest req = new BookingRequest();
        req.setResourceId(10L);
        req.setTitle("CS Lab Session");
        req.setPurpose("Practicals for IT3030");
        req.setStartTime(LocalDateTime.now().plusDays(1).withHour(9));
        req.setEndTime(LocalDateTime.now().plusDays(1).withHour(11));
        req.setAttendees(15);

        Booking savedBooking = Booking.builder()
                .id(100L).resource(testResource).requester(testUser)
                .title(req.getTitle()).purpose(req.getPurpose())
                .startTime(req.getStartTime()).endTime(req.getEndTime())
                .attendees(req.getAttendees()).status(BookingStatus.PENDING)
                .build();

        when(resourceRepository.findById(10L)).thenReturn(Optional.of(testResource));
        when(bookingRepository.hasConflict(eq(10L), any(), any(), isNull())).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);
        when(resourceService.toResponse(any())).thenReturn(null);

        BookingResponse response = bookingService.create(req, 1L);

        assertThat(response).isNotNull();
        assertThat(response.getStatus()).isEqualTo(BookingStatus.PENDING);
        verify(bookingRepository, times(1)).save(any(Booking.class));
        verify(notificationService, times(1)).send(anyLong(), any(), anyString(), anyString(), anyString(), anyLong());
    }

    /* ── approve/reject ─────────────────────────────────────── */

    @Test
    @DisplayName("Should throw BadRequestException when approving non-PENDING booking")
    void processAction_shouldThrow_whenNotPending() {
        Booking booking = Booking.builder()
                .id(1L).resource(testResource).requester(testUser)
                .status(BookingStatus.APPROVED).build();

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        BookingActionRequest req = new BookingActionRequest();
        req.setStatus(BookingStatus.APPROVED);

        assertThatThrownBy(() -> bookingService.processAction(1L, req, 99L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("PENDING");
    }

    /* ── cancel ─────────────────────────────────────────────── */

    @Test
    @DisplayName("Should throw BadRequestException when cancelling already cancelled booking")
    void cancel_shouldThrow_whenAlreadyCancelled() {
        Booking booking = Booking.builder()
                .id(1L).resource(testResource).requester(testUser)
                .status(BookingStatus.CANCELLED).build();

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.cancel(1L, 1L, false))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already cancelled");
    }
}
