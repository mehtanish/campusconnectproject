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
    private final ComplaintRepository complaintRepository;

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

    @GetMapping("/complaints/{id}")
    public ResponseEntity<AdminComplaintDetailResponse> getAdminComplaintDetails(
            @PathVariable UUID id,
            @AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(complaintService.getAdminComplaintDetails(id, admin.getRole()));
    }
    /** Update complaint status with admin note */
    @PatchMapping("/complaints/{id}/status")
    public ResponseEntity<ComplaintResponse> updateComplaintStatus(
            @PathVariable UUID id,
            @Valid @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(complaintService.updateStatus(id, request, admin));
    }

    /** Dashboard analytics stats */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(@AuthenticationPrincipal User admin) {
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
