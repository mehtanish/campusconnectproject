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
    private String issueTag;
    private UUID studentId;
    private String studentName;
    private ComplaintStatus status;
    private String adminNote;
    private Integer upvoteCount;
    private Double priorityScore;
    private boolean hasUpvoted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
