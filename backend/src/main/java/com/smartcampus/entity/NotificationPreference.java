package com.smartcampus.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notification_preferences")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Builder.Default
    @Column(name = "booking_updates", nullable = false)
    private Boolean bookingUpdates = true;

    @Builder.Default
    @Column(name = "ticket_updates", nullable = false)
    private Boolean ticketUpdates = true;

    @Builder.Default
    @Column(name = "comment_alerts", nullable = false)
    private Boolean commentAlerts = true;

    @Builder.Default
    @Column(name = "assignments", nullable = false)
    private Boolean assignments = true;

    @Builder.Default
    @Column(name = "system_alerts", nullable = false)
    private Boolean systemAlerts = true;
}
