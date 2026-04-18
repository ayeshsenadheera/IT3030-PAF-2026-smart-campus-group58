package com.smartcampus.repository;

import com.smartcampus.entity.Booking;
import com.smartcampus.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Page<Booking> findByRequesterId(Long requesterId, Pageable pageable);

    Page<Booking> findByStatus(BookingStatus status, Pageable pageable);

    /** Conflict detection: checks APPROVED + PENDING bookings for overlapping times */
    @Query("""
            SELECT COUNT(b) > 0 FROM Booking b
            WHERE b.resource.id = :resourceId
              AND b.status IN (com.smartcampus.enums.BookingStatus.APPROVED,
                               com.smartcampus.enums.BookingStatus.PENDING)
              AND b.startTime < :endTime
              AND b.endTime   > :startTime
              AND (:excludeId IS NULL OR b.id <> :excludeId)
            """)
    boolean hasConflict(
            @Param("resourceId") Long resourceId,
            @Param("startTime")  LocalDateTime startTime,
            @Param("endTime")    LocalDateTime endTime,
            @Param("excludeId")  Long excludeId
    );

    List<Booking> findByResourceIdAndStatusIn(Long resourceId, List<BookingStatus> statuses);

    @Query("""
            SELECT b FROM Booking b
            WHERE (:status IS NULL OR b.status = :status)
              AND (:requesterId IS NULL OR b.requester.id = :requesterId)
            ORDER BY b.createdAt DESC
            """)
    Page<Booking> findAllFiltered(
            @Param("status")      BookingStatus status,
            @Param("requesterId") Long requesterId,
            Pageable pageable
    );

    /** Get booked time ranges for a resource within a datetime range — for slot display */
    @Query(value = """
            SELECT b.start_time, b.end_time
            FROM bookings b
            WHERE b.resource_id = :resourceId
              AND b.status IN ('APPROVED', 'PENDING')
              AND b.start_time >= :from
              AND b.start_time < :to
            ORDER BY b.start_time
            """, nativeQuery = true)
    List<Object[]> findBookedSlotsInRange(
            @Param("resourceId") Long resourceId,
            @Param("from")       LocalDateTime from,
            @Param("to")         LocalDateTime to
    );

    /** Top 5 resources by approved booking count — for analytics */
    @Query(value = """
            SELECT r.name, COUNT(b.id) as cnt
            FROM bookings b
            JOIN resources r ON b.resource_id = r.id
            WHERE b.status = 'APPROVED'
            GROUP BY r.id, r.name
            ORDER BY cnt DESC
            LIMIT 5
            """, nativeQuery = true)
    List<Object[]> findTopResources();

    /** Bookings grouped by hour of day — for peak hours chart */
    @Query(value = """
            SELECT HOUR(b.start_time) as hr, COUNT(*) as cnt
            FROM bookings b
            WHERE b.status = 'APPROVED'
            GROUP BY HOUR(b.start_time)
            ORDER BY hr
            """, nativeQuery = true)
    List<Object[]> findBookingsByHour();

    /** Daily booking counts for the last N days — for trend chart */
    @Query(value = """
            SELECT DATE(b.created_at) as day, COUNT(*) as cnt
            FROM bookings b
            WHERE b.created_at >= :since
            GROUP BY DATE(b.created_at)
            ORDER BY DATE(b.created_at)
            """, nativeQuery = true)
    List<Object[]> findDailyBookingCounts(@Param("since") LocalDateTime since);
}
