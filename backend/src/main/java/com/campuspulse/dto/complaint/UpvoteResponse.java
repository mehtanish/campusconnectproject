package com.campuspulse.dto.complaint;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpvoteResponse {
    private boolean success;
    private String message;
    private Integer upvoteCount;
    private Double priorityScore;
    private boolean highPriority;
    private boolean hasUpvoted;
}