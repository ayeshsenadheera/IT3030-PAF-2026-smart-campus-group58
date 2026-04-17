


package com.smartcampus.service;

import com.smartcampus.dto.request.CommentRequest;
import com.smartcampus.dto.request.CommentUpdateRequest;
import com.smartcampus.dto.request.TicketRequest;
import com.smartcampus.dto.request.TicketUpdateRequest;
import com.smartcampus.dto.response.*;
import com.smartcampus.entity.*;
import com.smartcampus.enums.*;
import com.smartcampus.exception.AccessDeniedException;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository      ticketRepository;
    private final CommentRepository     commentRepository;
    private final UserRepository        userRepository;
    private final ResourceRepository    resourceRepository;
    private final NotificationService   notificationService;
    private final ResourceService       resourceService;

    @Transactional
    public TicketResponse create(TicketRequest req, Long creatorId) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", creatorId));

        Resource resource = null;
        if (req.getResourceId() != null) {
            resource = resourceRepository.findById(req.getResourceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resource", req.getResourceId()));
        }

        Ticket ticket = Ticket.builder()
                .createdBy(creator)
                .resource(resource)
                .title(req.getTitle())
                .description(req.getDescription())
                .category(req.getCategory())
                .priority(req.getPriority() != null ? req.getPriority() : TicketPriority.MEDIUM)
                .status(TicketStatus.OPEN)
                .preferredContact(req.getPreferredContact())
                .build();

        Ticket saved = ticketRepository.save(ticket);

        notificationService.send(creatorId, NotificationType.TICKET_UPDATE,
                "Ticket Created", "Your ticket \"" + req.getTitle() + "\" has been submitted.",
                "TICKET", saved.getId());

        return toResponse(saved, false);
    }

    @Transactional(readOnly = true)
    public PagedResponse<TicketResponse> search(TicketStatus status, TicketPriority priority,
                                                 TicketCategory category, String keyword,
                                                 Pageable pageable) {
        Page<TicketResponse> page = ticketRepository
                .searchTickets(status, priority, category, keyword, pageable)
                .map(t -> toResponse(t, false));
        return PagedResponse.of(page);
    }

    @Transactional(readOnly = true)
    public PagedResponse<TicketResponse> getMyTickets(Long userId, Pageable pageable) {
        Page<TicketResponse> page = ticketRepository
                .findByCreatedById(userId, pageable)
                .map(t -> toResponse(t, false));
        return PagedResponse.of(page);
    }

    @Transactional(readOnly = true)
    public PagedResponse<TicketResponse> getAssignedTickets(Long techId, Pageable pageable) {
        Page<TicketResponse> page = ticketRepository
                .findByAssignedToId(techId, pageable)
                .map(t -> toResponse(t, false));
        return PagedResponse.of(page);
    }

    @Transactional(readOnly = true)
    public TicketResponse getById(Long id, boolean includeComments) {
        Ticket ticket = findOrThrow(id);
        return toResponse(ticket, includeComments);
    }

    @Transactional
    public TicketResponse update(Long id, TicketUpdateRequest req, Long actorId) {
        Ticket ticket = findOrThrow(id);

        if (req.getStatus() != null) {
            validateStatusTransition(ticket.getStatus(), req.getStatus());
            ticket.setStatus(req.getStatus());
            if (req.getStatus() == TicketStatus.RESOLVED) {
                ticket.setResolvedAt(LocalDateTime.now());
            }
        }

        if (req.getAssignedToId() != null) {
            User tech = userRepository.findById(req.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", req.getAssignedToId()));
            ticket.setAssignedTo(tech);

            notificationService.send(tech.getId(), NotificationType.ASSIGNMENT,
                    "Ticket Assigned",
                    "You have been assigned ticket #" + ticket.getId() + ": " + ticket.getTitle(),
                    "TICKET", ticket.getId());
        }

        if (req.getResolutionNotes() != null) {
            ticket.setResolutionNotes(req.getResolutionNotes());
        }

        Ticket saved = ticketRepository.save(ticket);

        notificationService.send(ticket.getCreatedBy().getId(), NotificationType.TICKET_UPDATE,
                "Ticket Updated",
                "Your ticket \"" + ticket.getTitle() + "\" status changed to " + saved.getStatus(),
                "TICKET", saved.getId());

        return toResponse(saved, false);
    }

    @Transactional
    public CommentResponse addComment(Long ticketId, CommentRequest req, Long authorId,
                                       boolean isAdminOrTech) {
        Ticket ticket = findOrThrow(ticketId);
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", authorId));

        boolean internal = Boolean.TRUE.equals(req.getIsInternal()) && isAdminOrTech;

        Comment comment = Comment.builder()
                .ticket(ticket)
                .author(author)
                .body(req.getBody())
                .isInternal(internal)
                .build();

        Comment saved = commentRepository.save(comment);

        // Notify ticket creator if commenter is someone else
        if (!ticket.getCreatedBy().getId().equals(authorId) && !internal) {
            notificationService.send(ticket.getCreatedBy().getId(), NotificationType.COMMENT_ADDED,
                    "New Comment on Your Ticket",
                    author.getFullName() + " commented on ticket: " + ticket.getTitle(),
                    "TICKET", ticketId);
        }
        // Notify assigned technician
        if (ticket.getAssignedTo() != null && !ticket.getAssignedTo().getId().equals(authorId)) {
            notificationService.send(ticket.getAssignedTo().getId(), NotificationType.COMMENT_ADDED,
                    "New Comment on Assigned Ticket",
                    author.getFullName() + " commented on ticket: " + ticket.getTitle(),
                    "TICKET", ticketId);
        }

        return toCommentResponse(saved);
    }

    @Transactional
    public void deleteComment(Long commentId, Long userId, boolean isAdmin) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", commentId));
        if (!isAdmin && !comment.getAuthor().getId().equals(userId)) {
            throw new AccessDeniedException("You can only delete your own comments");
        }
        commentRepository.delete(comment);
    }

    @Transactional
    public TicketResponse addImages(Long ticketId, List<String> imageUrls, Long userId) {
        Ticket ticket = findOrThrow(ticketId);
        if (!ticket.getCreatedBy().getId().equals(userId)) {
            throw new AccessDeniedException("You can only add images to your own tickets");
        }
        int currentCount = ticket.getImages().size();
        if (currentCount + imageUrls.size() > 3) {
            throw new BadRequestException("Maximum 3 images allowed per ticket. Currently has " + currentCount);
        }
        imageUrls.forEach(url -> ticket.getImages().add(
                TicketImage.builder().ticket(ticket).imageUrl(url).build()));
        return toResponse(ticketRepository.save(ticket), false);
    }

    @Transactional
    public CommentResponse editComment(@NonNull Long commentId,
                                       @NonNull String newBody,
                                       @NonNull Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", commentId));
        if (!comment.getAuthor().getId().equals(userId)) {
            throw new AccessDeniedException("You can only edit your own comments");
        }
        comment.setBody(newBody);
        Comment saved = commentRepository.save(comment);
        return toCommentResponse(saved);
    }


    private void validateStatusTransition(TicketStatus current, TicketStatus next) {
        boolean valid = switch (current) {
            case OPEN        -> next == TicketStatus.IN_PROGRESS || next == TicketStatus.REJECTED;
            case IN_PROGRESS -> next == TicketStatus.RESOLVED    || next == TicketStatus.OPEN;
            case RESOLVED    -> next == TicketStatus.CLOSED      || next == TicketStatus.IN_PROGRESS;
            default          -> false;
        };
        if (!valid) {
            throw new BadRequestException("Invalid status transition: " + current + " → " + next);
        }
    }

    private Ticket findOrThrow(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id));
    }

    private TicketResponse toResponse(Ticket t, boolean includeComments) {
        List<CommentResponse> comments = includeComments
                ? commentRepository.findByTicketIdOrderByCreatedAtAsc(t.getId())
                        .stream().map(this::toCommentResponse).collect(Collectors.toList())
                : null;

        return TicketResponse.builder()
                .id(t.getId())
                .createdBy(userToResponse(t.getCreatedBy()))
                .assignedTo(userToResponse(t.getAssignedTo()))
                .resource(t.getResource() != null ? resourceService.toResponse(t.getResource()) : null)
                .title(t.getTitle())
                .description(t.getDescription())
                .category(t.getCategory())
                .priority(t.getPriority())
                .status(t.getStatus())
                .preferredContact(t.getPreferredContact())
                .resolutionNotes(t.getResolutionNotes())
                .imageUrls(t.getImages().stream().map(TicketImage::getImageUrl).collect(Collectors.toList()))
                .comments(comments)
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .resolvedAt(t.getResolvedAt())
                .build();
    }

    private CommentResponse toCommentResponse(Comment c) {
        return CommentResponse.builder()
                .id(c.getId())
                .author(userToResponse(c.getAuthor()))
                .body(c.getBody())
                .isInternal(c.getIsInternal())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
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
