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
public class ComplaintActivityResponse {
    /** Primary reference code in CMP-XXXX format (e.g. CMP-1048) */
    private String id;
    private String referenceId;
    private UUID complaintId;
    private String title;
    private String building;
    private String locationPath;
    private ComplaintStatus status;
    private Integer upvoteCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
