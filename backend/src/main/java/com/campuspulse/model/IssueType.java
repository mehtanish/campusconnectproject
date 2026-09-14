package com.campuspulse.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "issue_types",
    uniqueConstraints = @UniqueConstraint(columnNames = "stable_key"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueType {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Domain group for this issue type (e.g. "wifi", "washroom", "mess").
     * Used to filter issue types relevant to a given category branch.
     */
    @Column(name = "group_key", nullable = false)
    private String groupKey;

    /**
     * Stable, immutable key stored in Complaint.issueTag.
     * Never derived from user-supplied text — always from this table.
     * Example: "no-connectivity", "slow-speed", "food-quality".
     */
    @Column(name = "stable_key", nullable = false, unique = true)
    private String stableKey;

    /** Human-readable label shown in the UI dropdown. */
    @Column(name = "display_label", nullable = false)
    private String displayLabel;
}
