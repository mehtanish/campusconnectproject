package com.campuspulse.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "upvotes",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_upvotes_complaint_student",
        columnNames = {"complaint_id", "student_id"}),
    indexes = @Index(name = "idx_upvotes_student_id", columnList = "student_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Upvote {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
