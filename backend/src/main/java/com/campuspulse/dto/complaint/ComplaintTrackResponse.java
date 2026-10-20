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
public class ComplaintTrackResponse {
    private UUID id;
    private String referenceId;
    private String title;
    private String description;
    private String building;
    private String locationPath;
    private String categoryName;
    private String issueTag;
    private String issueTagLabel;
    private ComplaintStatus status;
    private String adminNote;
    private Integer upvoteCount;
    private Double priorityScore;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
