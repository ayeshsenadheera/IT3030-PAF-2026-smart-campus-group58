package com.smartcampus.repository;

import com.smartcampus.entity.Resource;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    @Query("""
            SELECT r FROM Resource r
            WHERE (:keyword IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(r.location) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:type   IS NULL OR r.type   = :type)
              AND (:status IS NULL OR r.status = :status)
            """)
    Page<Resource> search(
            @Param("keyword") String keyword,
            @Param("type")    ResourceType type,
            @Param("status")  ResourceStatus status,
            Pageable pageable
    );
}
