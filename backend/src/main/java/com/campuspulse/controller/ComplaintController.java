package com.campuspulse.controller;

import com.campuspulse.dto.complaint.*;
import com.campuspulse.model.User;
import com.campuspulse.service.ComplaintService;
import com.campuspulse.service.UpvoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;
    private final UpvoteService upvoteService;

    @PostMapping
    public ResponseEntity<ComplaintResponse> createComplaint(
            @Valid @RequestBody ComplaintRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(complaintService.createComplaint(request, user));
    }

    @GetMapping
    public ResponseEntity<List<ComplaintResponse>> getAllComplaints(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(complaintService.getAllComplaints(user.getId()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ComplaintResponse>> getMyComplaints(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(complaintService.getMyComplaints(user));
    }

    @GetMapping("/upvoted")
    public ResponseEntity<List<ComplaintResponse>> getUpvotedComplaints(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(complaintService.getUpvotedComplaints(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComplaintResponse> getComplaintById(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(complaintService.getComplaintById(id, user.getId()));
    }

    @PostMapping("/check-duplicate")
    public ResponseEntity<DuplicateCheckResponse> checkDuplicate(
            @RequestBody DuplicateCheckRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(complaintService.checkDuplicate(request, user.getId()));
    }

    @PostMapping("/{id}/upvote")
    public ResponseEntity<UpvoteResponse> upvote(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(upvoteService.upvote(id, user));
    }

    @DeleteMapping("/{id}/upvote")
    public ResponseEntity<UpvoteResponse> removeUpvote(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(upvoteService.removeUpvote(id, user));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ComplaintResponse> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(complaintService.updateStatus(id, request, user));
    }
}
