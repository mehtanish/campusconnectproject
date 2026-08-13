package com.campuspulse.dto.lostfound;

import com.campuspulse.model.enums.ClaimStatus;
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
public class ClaimResponse {
    private UUID id;
    private UUID itemId;
    private String itemTitle;
    private UUID claimantId;
    private String claimantName;
    private String claimantRollNo;
    private String proofDescription;
    private ClaimStatus status;
    private String claimCode;
    private LocalDateTime createdAt;
}
