package com.campuspulse.controller;

import com.campuspulse.dto.comment.CommentRequest;
import com.campuspulse.dto.comment.CommentResponse;
import com.campuspulse.dto.complaint.*;
import com.campuspulse.model.User;
import com.campuspulse.service.CommentService;
import com.campuspulse.service.ComplaintService;
import com.campuspulse.service.UpvoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;
    private final UpvoteService upvoteService;
    private final CommentService commentService;

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

    @GetMapping("/track/{code}")
    public ResponseEntity<ComplaintTrackResponse> trackComplaint(@PathVariable String code) {
        return ResponseEntity.ok(complaintService.trackComplaint(code));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComplaintResponse> getComplaintById(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(complaintService.getComplaintById(id, user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteComplaint(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        complaintService.deleteComplaint(id, user);
        return ResponseEntity.ok(Map.of("message", "Complaint deleted successfully"));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(
            @PathVariable UUID id) {
        return ResponseEntity.ok(commentService.getCommentsByComplaint(id));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(commentService.addComment(id, request, user));
    }

    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Map<String, String>> deleteComment(
            @PathVariable UUID id,
            @PathVariable UUID commentId,
            @AuthenticationPrincipal User user) {
        commentService.deleteComment(commentId, user);
        return ResponseEntity.ok(Map.of("message", "Comment deleted successfully"));
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
