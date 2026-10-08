package com.campuspulse.dto.complaint;

import com.campuspulse.model.enums.ComplaintStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record AdminComplaintDetailResponse(
        UUID id,
        String title,
        String description,
        ComplaintStatus status,
        int upvoteCount,
        Reporter createdBy,
        List<Upvoter> upvotes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

    public record Reporter(UUID id, String name, String email) {}

    public record Upvoter(Reporter user, LocalDateTime createdAt) {}
}