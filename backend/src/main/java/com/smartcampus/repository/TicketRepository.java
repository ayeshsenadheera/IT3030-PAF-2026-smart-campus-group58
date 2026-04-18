package com.smartcampus.repository;

import com.smartcampus.entity.Ticket;
import com.smartcampus.enums.TicketCategory;
import com.smartcampus.enums.TicketPriority;
import com.smartcampus.enums.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    Page<Ticket> findByCreatedById(Long userId, Pageable pageable);

    Page<Ticket> findByAssignedToId(Long technicianId, Pageable pageable);

    @Query("""
            SELECT t FROM Ticket t
            WHERE (:status   IS NULL OR t.status   = :status)
              AND (:priority IS NULL OR t.priority = :priority)
              AND (:category IS NULL OR t.category = :category)
              AND (:keyword  IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
            ORDER BY
              CASE t.priority
                WHEN 'CRITICAL' THEN 1
                WHEN 'HIGH'     THEN 2
                WHEN 'MEDIUM'   THEN 3
                WHEN 'LOW'      THEN 4
              END,
              t.createdAt DESC
            """)
    Page<Ticket> searchTickets(
            @Param("status")   TicketStatus status,
            @Param("priority") TicketPriority priority,
            @Param("category") TicketCategory category,
            @Param("keyword")  String keyword,
            Pageable pageable
    );

    long countByStatus(TicketStatus status);
}
