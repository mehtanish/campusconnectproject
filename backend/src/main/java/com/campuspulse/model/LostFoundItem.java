package com.campuspulse.model;

import com.campuspulse.model.enums.ItemStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "lost_found_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LostFoundItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String foundLocation;

    @Column(nullable = false)
    private LocalDate foundDate;

    /** URL/path to uploaded image */
    private String imageUrl;

    /** Redacted verification details only visible to admin (e.g. "has a scratch on the back") */
    @Column(columnDefinition = "TEXT")
    private String hiddenDetails;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ItemStatus status = ItemStatus.LISTED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "finder_id", nullable = false)
    private User finder;

    /** Auto-generated 6-digit alphanumeric claim code (set on claim approval) */
    @Column(unique = true)
    private String claimCode;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
