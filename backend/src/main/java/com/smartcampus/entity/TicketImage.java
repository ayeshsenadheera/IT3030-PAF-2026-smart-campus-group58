package com.smartcampus.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_images")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TicketImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @Column(nullable = false)
    private String imageUrl;

    private String fileName;

    @Builder.Default
    private LocalDateTime uploadedAt = LocalDateTime.now();
}
