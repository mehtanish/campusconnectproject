package com.campuspulse.controller;

import com.campuspulse.dto.complaint.ComplaintResponse;
import com.campuspulse.dto.complaint.StatusUpdateRequest;
import com.campuspulse.dto.lostfound.ClaimResponse;
import com.campuspulse.model.User;
import com.campuspulse.model.enums.ComplaintStatus;
import com.campuspulse.model.enums.Role;
import com.campuspulse.repository.ComplaintRepository;
import com.campuspulse.repository.LostFoundItemRepository;
import com.campuspulse.service.ClaimService;
import com.campuspulse.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ComplaintService complaintService;
    private final ClaimService claimService;
    private final ComplaintRepository complaintRepository;
    private final LostFoundItemRepository lostFoundItemRepository;

    /** Get complaints filtered by admin's domain role */
    @GetMapping("/complaints")
    public ResponseEntity<List<ComplaintResponse>> getAdminComplaints(
            @AuthenticationPrincipal User admin) {
        if (admin.getRole() == Role.SUPER_ADMIN) {
            return ResponseEntity.ok(complaintService.getAllComplaints(admin.getId()));
        }
        return ResponseEntity.ok(complaintService.getComplaintsByAdminRole(
                admin.getRole(), admin.getId()));
    }

    /** Update complaint status with admin note */
    @PatchMapping("/complaints/{id}/status")
    public ResponseEntity<ComplaintResponse> updateComplaintStatus(
            @PathVariable UUID id,
            @Valid @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(complaintService.updateStatus(id, request, admin));
    }

    /** Get pending claims for admin review */
    @GetMapping("/claims/pending")
    public ResponseEntity<List<ClaimResponse>> getPendingClaims() {
        return ResponseEntity.ok(claimService.getPendingClaims());
    }

    /** Approve a claim and generate claim code */
    @PostMapping("/lost-found/{claimId}/approve")
    public ResponseEntity<ClaimResponse> approveClaim(@PathVariable UUID claimId) {
        return ResponseEntity.ok(claimService.approveClaim(claimId));
    }

    /** Reject a claim */
    @PostMapping("/lost-found/{claimId}/reject")
    public ResponseEntity<ClaimResponse> rejectClaim(@PathVariable UUID claimId) {
        return ResponseEntity.ok(claimService.rejectClaim(claimId));
    }

    /** Dashboard analytics stats */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(@AuthenticationPrincipal User admin) {
        long totalComplaints = complaintRepository.count();
        long pendingComplaints = complaintRepository.countByStatus(ComplaintStatus.PENDING);
        long resolvedComplaints = complaintRepository.countByStatus(ComplaintStatus.RESOLVED);
        long inProgressComplaints = complaintRepository.countByStatus(ComplaintStatus.IN_PROGRESS);
        long totalLostFound = lostFoundItemRepository.count();

        return ResponseEntity.ok(Map.of(
                "totalComplaints", totalComplaints,
                "pendingComplaints", pendingComplaints,
                "resolvedComplaints", resolvedComplaints,
                "inProgressComplaints", inProgressComplaints,
                "totalLostFound", totalLostFound
        ));
    }
}
