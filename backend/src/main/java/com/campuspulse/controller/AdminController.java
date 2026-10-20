package com.campuspulse.controller;

import com.campuspulse.dto.complaint.ComplaintResponse;
import com.campuspulse.dto.complaint.AdminComplaintDetailResponse;
import com.campuspulse.dto.complaint.StatusUpdateRequest;
import com.campuspulse.model.User;
import com.campuspulse.model.enums.ComplaintStatus;
import com.campuspulse.model.enums.Role;
import com.campuspulse.repository.ComplaintRepository;
import com.campuspulse.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyRole('ADMIN_WIFI', 'ADMIN_MAINTENANCE', 'ADMIN_MESS', 'ADMIN_ACADEMIC', 'SUPER_ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final ComplaintService complaintService;
    private final ComplaintRepository complaintRepository;
    private final com.campuspulse.service.CommentService commentService;

    private void assertAdmin(User admin) {
        if (admin == null || admin.getRole() == Role.STUDENT) {
            throw new AccessDeniedException("Access denied: Administrator privileges required.");
        }
    }

    /** Get complaints filtered by admin's domain role */
    @GetMapping("/complaints")
    public ResponseEntity<List<ComplaintResponse>> getAdminComplaints(
            @AuthenticationPrincipal User admin) {
        assertAdmin(admin);
        if (admin.getRole() == Role.SUPER_ADMIN) {
            return ResponseEntity.ok(complaintService.getAllComplaints(admin.getId()));
        }
        return ResponseEntity.ok(complaintService.getComplaintsByAdminRole(
                admin.getRole(), admin.getId()));
    }

    @GetMapping("/complaints/{id}")
    public ResponseEntity<AdminComplaintDetailResponse> getAdminComplaintDetails(
            @PathVariable UUID id,
            @AuthenticationPrincipal User admin) {
        assertAdmin(admin);
        return ResponseEntity.ok(complaintService.getAdminComplaintDetails(id, admin.getRole()));
    }

    /** Delete complaint as admin */
    @DeleteMapping("/complaints/{id}")
    public ResponseEntity<Map<String, String>> deleteComplaint(
            @PathVariable UUID id,
            @AuthenticationPrincipal User admin) {
        assertAdmin(admin);
        complaintService.deleteComplaint(id, admin);
        return ResponseEntity.ok(Map.of("message", "Complaint deleted successfully by admin"));
    }

    /** Add comment on complaint */
    @PostMapping("/complaints/{id}/comments")
    public ResponseEntity<com.campuspulse.dto.comment.CommentResponse> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody com.campuspulse.dto.comment.CommentRequest request,
            @AuthenticationPrincipal User admin) {
        assertAdmin(admin);
        return ResponseEntity.ok(commentService.addComment(id, request, admin));
    }

    /** Delete comment (moderation) */
    @DeleteMapping("/complaints/{id}/comments/{commentId}")
    public ResponseEntity<Map<String, String>> deleteComment(
            @PathVariable UUID id,
            @PathVariable UUID commentId,
            @AuthenticationPrincipal User admin) {
        assertAdmin(admin);
        commentService.deleteComment(commentId, admin);
        return ResponseEntity.ok(Map.of("message", "Comment deleted successfully"));
    }

    /** Update complaint status with admin note */
    @PatchMapping("/complaints/{id}/status")
    public ResponseEntity<ComplaintResponse> updateComplaintStatus(
            @PathVariable UUID id,
            @Valid @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal User admin) {
        assertAdmin(admin);
        return ResponseEntity.ok(complaintService.updateStatus(id, request, admin));
    }

    /** Dashboard analytics stats */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(@AuthenticationPrincipal User admin) {
        assertAdmin(admin);
        long totalComplaints;
        long pendingComplaints;
        long resolvedComplaints;
        long inProgressComplaints;

        if (admin.getRole() == Role.SUPER_ADMIN) {
            totalComplaints = complaintRepository.count();
            pendingComplaints = complaintRepository.countByStatus(ComplaintStatus.PENDING);
            resolvedComplaints = complaintRepository.countByStatus(ComplaintStatus.RESOLVED);
            inProgressComplaints = complaintRepository.countByStatus(ComplaintStatus.IN_PROGRESS);
        } else {
            List<ComplaintResponse> domainComplaints = complaintService.getComplaintsByAdminRole(admin.getRole(), admin.getId());
            totalComplaints = domainComplaints.size();
            pendingComplaints = domainComplaints.stream().filter(c -> c.getStatus() == ComplaintStatus.PENDING).count();
            resolvedComplaints = domainComplaints.stream().filter(c -> c.getStatus() == ComplaintStatus.RESOLVED).count();
            inProgressComplaints = domainComplaints.stream().filter(c -> c.getStatus() == ComplaintStatus.IN_PROGRESS).count();
        }

        return ResponseEntity.ok(Map.of(
                "totalComplaints", totalComplaints,
                "pendingComplaints", pendingComplaints,
                "resolvedComplaints", resolvedComplaints,
                "inProgressComplaints", inProgressComplaints
        ));
    }
}
