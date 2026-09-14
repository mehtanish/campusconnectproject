package com.campuspulse.model;

import com.campuspulse.model.enums.ComplaintStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "complaints")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    /** Flattened location path, e.g. "WiFi Issues > Hostel WiFi > Block A" */
    @Column(nullable = false)
    private String locationPath;

    /** Tag used for deduplication matching (e.g. "slow_speed", "no_connection") */
    private String issueTag;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ComplaintStatus status = ComplaintStatus.PENDING;

    /** Official response note from admin */
    @Column(columnDefinition = "TEXT")
    private String adminNote;

    @Column(nullable = false)
    @Builder.Default
    private Integer upvoteCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private Double priorityScore = 0.0;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
