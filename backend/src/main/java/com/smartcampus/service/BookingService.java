package com.smartcampus.service;

import com.smartcampus.dto.request.BookingActionRequest;
import com.smartcampus.dto.request.BookingRequest;
import com.smartcampus.dto.response.BookingResponse;
import com.smartcampus.dto.response.PagedResponse;
import com.smartcampus.dto.response.UserResponse;
import com.smartcampus.entity.Booking;
import com.smartcampus.entity.Resource;
import com.smartcampus.entity.User;
import com.smartcampus.enums.BookingStatus;
import com.smartcampus.enums.NotificationType;
import com.smartcampus.exception.AccessDeniedException;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ConflictException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository   bookingRepository;
    private final ResourceRepository  resourceRepository;
    private final UserRepository      userRepository;
    private final NotificationService notificationService;
    private final ResourceService     resourceService;

    @Transactional
    public BookingResponse create(@NonNull BookingRequest req, @NonNull Long requesterId) {

        if (!req.getStartTime().isAfter(LocalDateTime.now())) {
            throw new BadRequestException("Start time must be in the future.");
        }
        if (!req.getEndTime().isAfter(req.getStartTime())) {
            throw new BadRequestException("End time must be after start time.");
        }

        // Enforce university operating hours 08:30 - 17:30
        int startHour = req.getStartTime().getHour();
        int startMin  = req.getStartTime().getMinute();
        int endHour   = req.getEndTime().getHour();
        int endMin    = req.getEndTime().getMinute();

        boolean startOk = (startHour > 8 || (startHour == 8 && startMin >= 30))
                       && (startHour < 17 || (startHour == 17 && startMin == 0));
        boolean endOk   = (endHour > 8 || (endHour == 8 && endMin >= 30))
                       && (endHour < 17 || (endHour == 17 && endMin <= 30));

        if (!startOk || !endOk) {
            throw new BadRequestException(
                "Bookings must be within university hours: 8:30 AM to 5:30 PM.");
        }

        long durationMins  = Duration.between(req.getStartTime(), req.getEndTime()).toMinutes();
        long durationHours = Duration.between(req.getStartTime(), req.getEndTime()).toHours();
        if (durationMins > 300) {
            throw new BadRequestException(
                "Maximum booking duration is 5 hours. Your booking is " + durationHours + " hour(s).");
        }

        Resource resource = resourceRepository.findById(req.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource", req.getResourceId()));

        if (bookingRepository.hasConflict(
                Objects.requireNonNull(resource.getId()),
                req.getStartTime(), req.getEndTime(), null)) {
            throw new ConflictException("Resource is already booked for this time slot.");
        }

        if (resource.getCapacity() != null && req.getAttendees() != null
                && req.getAttendees() > resource.getCapacity()) {
            throw new BadRequestException(
                    "Number of attendees (" + req.getAttendees() + ") exceeds the capacity of "
                    + resource.getName() + " (" + resource.getCapacity() + " seats).");
        }

        if (resource.getCapacity() != null && (req.getAttendees() == null || req.getAttendees() < 1)) {
            throw new BadRequestException("Please enter the number of attendees.");
        }

        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", requesterId));

        Booking booking = Booking.builder()
                .resource(resource)
                .requester(requester)
                .title(req.getTitle())
                .purpose(req.getPurpose())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .attendees(req.getAttendees())
                .status(BookingStatus.PENDING)
                .build();

        Booking saved = bookingRepository.save(booking);

        notificationService.send(requesterId, NotificationType.BOOKING_UPDATE,
                "Booking Submitted",
                "Your booking for " + resource.getName() + " is pending approval.",
                "BOOKING", Objects.requireNonNull(saved.getId()));

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public PagedResponse<BookingResponse> getAll(BookingStatus status, Long requesterId,
                                                  @NonNull Pageable pageable) {
        Page<BookingResponse> page = bookingRepository
                .findAllFiltered(status, requesterId, pageable)
                .map(this::toResponse);
        return PagedResponse.of(page);
    }

    @Transactional(readOnly = true)
    public PagedResponse<BookingResponse> getMyBookings(@NonNull Long userId,
                                                         @NonNull Pageable pageable) {
        Page<BookingResponse> page = bookingRepository
                .findByRequesterId(userId, pageable)
                .map(this::toResponse);
        return PagedResponse.of(page);
    }

    @Transactional(readOnly = true)
    public BookingResponse getById(@NonNull Long id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public BookingResponse processAction(@NonNull Long id,
                                          @NonNull BookingActionRequest req,
                                          @NonNull Long adminId) {
        Booking booking = findOrThrow(id);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING bookings can be approved or rejected.");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", adminId));

        booking.setStatus(req.getStatus());
        booking.setApprovedBy(admin);
        booking.setAdminNotes(req.getAdminNotes());
        Booking saved = bookingRepository.save(booking);

        notificationService.send(
                Objects.requireNonNull(booking.getRequester().getId()),
                NotificationType.BOOKING_UPDATE,
                "Booking " + req.getStatus().name(),
                "Your booking for " + booking.getResource().getName()
                        + " has been " + req.getStatus().name().toLowerCase() + ".",
                "BOOKING", id);

        return toResponse(saved);
    }

    @Transactional
    public BookingResponse cancel(@NonNull Long id, @NonNull Long userId, boolean isAdmin) {
        Booking booking = findOrThrow(id);

        if (!isAdmin && !Objects.equals(booking.getRequester().getId(), userId)) {
            throw new AccessDeniedException("You can only cancel your own bookings.");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);

        notificationService.send(
                Objects.requireNonNull(booking.getRequester().getId()),
                NotificationType.BOOKING_UPDATE,
                "Booking Cancelled",
                "Your booking for " + booking.getResource().getName() + " was cancelled.",
                "BOOKING", id);

        return toResponse(saved);
    }

    /**
     * Returns 1-hour time slots for a resource on a given date.
     * University operating hours: 08:30 to 17:30 = 9 slots per day.
     * Slot status: AVAILABLE, BOOKED, or PAST.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAvailableSlots(@NonNull Long resourceId,
                                                        @NonNull String dateStr) {
        LocalDate date;
        try {
            date = LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (Exception e) {
            throw new BadRequestException("Invalid date format. Use YYYY-MM-DD");
        }

        LocalDateTime now      = LocalDateTime.now();
        LocalDateTime dayStart = date.atTime(8, 30);  // 08:30 AM
        LocalDateTime dayEnd   = date.atTime(17, 30); // 05:30 PM

        // Fetch all APPROVED/PENDING bookings for this resource on this day
        List<Object[]> booked = bookingRepository.findBookedSlotsInRange(
                resourceId, dayStart, dayEnd);

        List<Map<String, Object>> slots = new ArrayList<>();

        // Generate 1-hour slots: 08:30-09:30, 09:30-10:30 ... 16:30-17:30 (9 slots)
        LocalDateTime slotStart = dayStart;
        while (slotStart.isBefore(dayEnd)) {
            LocalDateTime slotEnd = slotStart.plusHours(1);

            boolean isPast   = slotEnd.isBefore(now) || slotEnd.isEqual(now);
            boolean isBooked = false;

            for (Object[] bk : booked) {
                LocalDateTime bkStart = ((Timestamp) bk[0]).toLocalDateTime();
                LocalDateTime bkEnd   = ((Timestamp) bk[1]).toLocalDateTime();
                if (slotStart.isBefore(bkEnd) && slotEnd.isAfter(bkStart)) {
                    isBooked = true;
                    break;
                }
            }

            Map<String, Object> slot = new LinkedHashMap<>();
            slot.put("startTime", slotStart.toString());
            slot.put("endTime",   slotEnd.toString());
            slot.put("label",     slotStart.toLocalTime() + " – " + slotEnd.toLocalTime());
            slot.put("status",    isPast ? "PAST" : isBooked ? "BOOKED" : "AVAILABLE");
            slot.put("available", !isPast && !isBooked);
            slots.add(slot);

            slotStart = slotStart.plusHours(1);
        }

        return slots;
    }

    private Booking findOrThrow(@NonNull Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));
    }

    private BookingResponse toResponse(@NonNull Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .resource(resourceService.toResponse(b.getResource()))
                .requester(userToResponse(b.getRequester()))
                .approvedBy(userToResponse(b.getApprovedBy()))
                .title(b.getTitle())
                .purpose(b.getPurpose())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .attendees(b.getAttendees())
                .status(b.getStatus())
                .adminNotes(b.getAdminNotes())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }

    private UserResponse userToResponse(User u) {
        if (u == null) return null;
        return UserResponse.builder()
                .id(u.getId())
                .email(u.getEmail())
                .fullName(u.getFullName())
                .avatarUrl(u.getAvatarUrl())
                .build();
    }
}