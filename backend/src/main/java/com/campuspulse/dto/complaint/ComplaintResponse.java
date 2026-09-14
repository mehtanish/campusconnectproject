package com.campuspulse.dto.complaint;

import com.campuspulse.model.enums.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintResponse {
    private UUID id;
    private String title;
    private String description;
    private UUID categoryId;
    private String categoryName;
    private String locationPath;
    /** Stable key from controlled vocabulary (e.g. "no-connectivity") */
    private String issueTag;
    /** Human-readable label for the issueTag (e.g. "No connectivity") */
    private String issueTagLabel;
    private UUID studentId;
    private String studentName;
    private ComplaintStatus status;
    private String adminNote;
    private Integer upvoteCount;
    private Double priorityScore;
    /** Derived: upvoteCount >= 15. Never stored — always computed from upvoteCount */
    private boolean highPriority;
    private boolean hasUpvoted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
