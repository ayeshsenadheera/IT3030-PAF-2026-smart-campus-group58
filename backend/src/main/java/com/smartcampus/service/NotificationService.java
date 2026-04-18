package com.smartcampus.service;

import com.smartcampus.dto.response.NotificationResponse;
import com.smartcampus.dto.response.PagedResponse;
import com.smartcampus.entity.Notification;
import com.smartcampus.entity.NotificationPreference;
import com.smartcampus.entity.User;
import com.smartcampus.enums.NotificationType;
import com.smartcampus.exception.AccessDeniedException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.NotificationPreferenceRepository;
import com.smartcampus.repository.NotificationRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository         notificationRepository;
    private final UserRepository                 userRepository;
    private final NotificationPreferenceRepository prefRepository;

    @Async
    @Transactional
    public void send(@NonNull Long userId,
                     @NonNull NotificationType type,
                     @NonNull String title,
                     @NonNull String message,
                     String refType,
                     Long refId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                log.warn("Notification skipped — user not found: {}", userId);
                return;
            }

            // Check user preferences — skip if this category is muted
            if (!isAllowed(userId, type)) {
                log.debug("Notification muted by user {} for type {}", userId, type);
                return;
            }

            Notification notification = Notification.builder()
                    .user(user)
                    .type(type)
                    .title(title)
                    .message(message)
                    .refType(refType)
                    .refId(refId)
                    .isRead(false)
                    .build();
            notificationRepository.save(notification);
        } catch (Exception e) {
            log.error("Failed to send notification to user {}: {}", userId, e.getMessage());
        }
    }

    /** Check whether the user has this notification type enabled */
    private boolean isAllowed(Long userId, NotificationType type) {
        try {
            NotificationPreference pref = prefRepository.findByUserId(userId).orElse(null);
            if (pref == null) return true; // default: allow all

            return switch (type) {
                case BOOKING_UPDATE -> Boolean.TRUE.equals(pref.getBookingUpdates());
                case TICKET_UPDATE  -> Boolean.TRUE.equals(pref.getTicketUpdates());
                case COMMENT_ADDED  -> Boolean.TRUE.equals(pref.getCommentAlerts());
                case ASSIGNMENT     -> Boolean.TRUE.equals(pref.getAssignments());
                case SYSTEM         -> Boolean.TRUE.equals(pref.getSystemAlerts());
            };
        } catch (Exception e) {
            log.warn("Could not check notification preferences for user {}: {}", userId, e.getMessage());
            return true; // fail open — send anyway
        }
    }

    @Transactional(readOnly = true)
    public PagedResponse<NotificationResponse> getMyNotifications(@NonNull Long userId,
                                                                   @NonNull Pageable pageable) {
        Page<NotificationResponse> page = notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toResponse);
        return PagedResponse.of(page);
    }

    @Transactional(readOnly = true)
    public long countUnread(@NonNull Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markRead(@NonNull Long notificationId, @NonNull Long userId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId));
        if (!n.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Not your notification");
        }
        n.setIsRead(true);
        notificationRepository.save(n);
    }

    @Transactional
    public int markAllRead(@NonNull Long userId) {
        return notificationRepository.markAllReadByUserId(userId);
    }

    private NotificationResponse toResponse(@NonNull Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .isRead(n.getIsRead())
                .refType(n.getRefType())
                .refId(n.getRefId())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
