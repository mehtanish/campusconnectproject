package com.campuspulse.service;

import com.campuspulse.dto.complaint.*;
import com.campuspulse.model.Category;
import com.campuspulse.model.Complaint;
import com.campuspulse.model.User;
import com.campuspulse.model.enums.ComplaintStatus;
import com.campuspulse.model.enums.Role;
import com.campuspulse.repository.CategoryRepository;
import com.campuspulse.repository.ComplaintRepository;
import com.campuspulse.repository.UpvoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final CategoryRepository categoryRepository;
    private final UpvoteRepository upvoteRepository;

    private static final double BASE_URGENCY = 1.0;

    @Transactional
    public ComplaintResponse createComplaint(ComplaintRequest request, User student) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Complaint complaint = Complaint.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(category)
                .locationPath(request.getLocationPath())
                .issueTag(request.getIssueTag())
                .student(student)
                .status(ComplaintStatus.PENDING)
                .upvoteCount(0)
                .priorityScore(BASE_URGENCY)
                .build();

        complaint = complaintRepository.save(complaint);
        return toResponse(complaint, student.getId());
    }

    public DuplicateCheckResponse checkDuplicate(DuplicateCheckRequest request) {
        List<ComplaintStatus> activeStatuses = Arrays.asList(
                ComplaintStatus.PENDING, ComplaintStatus.APPROVED, ComplaintStatus.IN_PROGRESS);

        List<Complaint> duplicates = complaintRepository.findDuplicates(
                request.getLocationPath(), request.getIssueTag(), activeStatuses);

        if (!duplicates.isEmpty()) {
            Complaint existing = duplicates.get(0);
            return DuplicateCheckResponse.builder()
                    .isDuplicate(true)
                    .existingComplaint(toResponse(existing, null))
                    .build();
        }

        return DuplicateCheckResponse.builder()
                .isDuplicate(false)
                .build();
    }

    public List<ComplaintResponse> getMyComplaints(User student) {
        return complaintRepository.findByStudentIdOrderByCreatedAtDesc(student.getId())
                .stream()
                .map(c -> toResponse(c, student.getId()))
                .collect(Collectors.toList());
    }

    public List<ComplaintResponse> getAllComplaints(UUID currentUserId) {
        return complaintRepository.findAllByOrderByPriorityScoreDesc()
                .stream()
                .map(c -> toResponse(c, currentUserId))
                .collect(Collectors.toList());
    }

    public List<ComplaintResponse> getComplaintsByAdminRole(Role adminRole, UUID currentUserId) {
        return complaintRepository.findByAdminRoleOrderByPriorityDesc(adminRole)
                .stream()
                .map(c -> toResponse(c, currentUserId))
                .collect(Collectors.toList());
    }

    @Transactional
    public ComplaintResponse updateStatus(UUID complaintId, StatusUpdateRequest request, User admin) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        complaint.setStatus(request.getStatus());
        if (request.getAdminNote() != null && !request.getAdminNote().isBlank()) {
            complaint.setAdminNote(request.getAdminNote());
        }

        complaint = complaintRepository.save(complaint);
        return toResponse(complaint, admin.getId());
    }

    public ComplaintResponse getComplaintById(UUID id, UUID currentUserId) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        return toResponse(complaint, currentUserId);
    }

    /** Recalculate priority: upvotes × 1.5 + BASE_URGENCY */
    @Transactional
    public void recalculatePriority(UUID complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        long upvoteCount = upvoteRepository.countByComplaintId(complaintId);
        complaint.setUpvoteCount((int) upvoteCount);
        complaint.setPriorityScore(upvoteCount * 1.5 + BASE_URGENCY);
        complaintRepository.save(complaint);
    }

    private ComplaintResponse toResponse(Complaint complaint, UUID currentUserId) {
        boolean hasUpvoted = false;
        if (currentUserId != null) {
            hasUpvoted = upvoteRepository.existsByComplaintIdAndStudentId(
                    complaint.getId(), currentUserId);
        }

        return ComplaintResponse.builder()
                .id(complaint.getId())
                .title(complaint.getTitle())
                .description(complaint.getDescription())
                .categoryId(complaint.getCategory().getId())
                .categoryName(complaint.getCategory().getName())
                .locationPath(complaint.getLocationPath())
                .issueTag(complaint.getIssueTag())
                .studentId(complaint.getStudent().getId())
                .studentName(complaint.getStudent().getName())
                .status(complaint.getStatus())
                .adminNote(complaint.getAdminNote())
                .upvoteCount(complaint.getUpvoteCount())
                .priorityScore(complaint.getPriorityScore())
                .hasUpvoted(hasUpvoted)
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .build();
    }
}
