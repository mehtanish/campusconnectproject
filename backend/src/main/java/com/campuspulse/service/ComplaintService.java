package com.campuspulse.service;

import com.campuspulse.dto.complaint.*;
import com.campuspulse.model.Category;
import com.campuspulse.model.Complaint;
import com.campuspulse.model.User;
import com.campuspulse.model.enums.ComplaintStatus;
import com.campuspulse.model.enums.Role;
import com.campuspulse.repository.CategoryRepository;
import com.campuspulse.repository.ComplaintRepository;
import com.campuspulse.repository.IssueTypeRepository;
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
@SuppressWarnings("null")
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final CategoryRepository categoryRepository;
    private final UpvoteRepository upvoteRepository;
    private final IssueTypeRepository issueTypeRepository;
    private final IssueTypeService issueTypeService;

    private static final double BASE_URGENCY = 1.0;

    @Transactional
    public ComplaintResponse createComplaint(ComplaintRequest request, User student) {
        // Validate issueTag against the controlled vocabulary before anything else
        issueTypeService.validateStableKey(request.getIssueTag());

        // Deduplication guard: block duplicate registration for active status at this 4-level location path
        List<ComplaintStatus> activeStatuses = Arrays.asList(
                ComplaintStatus.PENDING, ComplaintStatus.APPROVED, ComplaintStatus.IN_PROGRESS);
        List<Complaint> duplicates = complaintRepository.findDuplicates(request.getLocationPath(), activeStatuses);
        if (!duplicates.isEmpty()) {
            throw new RuntimeException("A complaint for this location path is already registered. Please upvote the existing complaint instead!");
        }

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
                .priorityScore(BASE_URGENCY)  // 0 * 1.5 + 1.0 = 1.0
                .build();

        complaint = complaintRepository.save(complaint);
        return toResponse(complaint, student.getId());
    }

    public DuplicateCheckResponse checkDuplicate(DuplicateCheckRequest request) {
        if (request.getLocationPath() == null || request.getLocationPath().isBlank()) {
            return DuplicateCheckResponse.builder().isDuplicate(false).build();
        }

        List<ComplaintStatus> activeStatuses = Arrays.asList(
                ComplaintStatus.PENDING, ComplaintStatus.APPROVED, ComplaintStatus.IN_PROGRESS);

        List<Complaint> duplicates = complaintRepository.findDuplicates(request.getLocationPath(), activeStatuses);

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

    public List<ComplaintResponse> getUpvotedComplaints(User student) {
        return upvoteRepository.findUpvotedComplaintsByStudentId(student.getId())
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

    /**
     * Recalculate priority: upvotes × 1.5 + BASE_URGENCY (1.0).
     * Must be called within the same transaction as the upvote insert.
     */
    @Transactional
    public void recalculatePriority(UUID complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        long upvoteCount = upvoteRepository.countByComplaintId(complaintId);
        complaint.setUpvoteCount((int) upvoteCount);
        complaint.setPriorityScore(upvoteCount * 1.5 + BASE_URGENCY);
        complaintRepository.save(complaint);
    }

    /**
     * Builds the complaint response, computing all three priority fields in sync:
     * upvoteCount, priorityScore, and highPriority (derived: upvoteCount >= 15).
     */
    ComplaintResponse toResponse(Complaint complaint, UUID currentUserId) {
        boolean hasUpvoted = false;
        if (currentUserId != null) {
            hasUpvoted = upvoteRepository.existsByComplaintIdAndStudentId(
                    complaint.getId(), currentUserId);
        }

        int upvoteCount = complaint.getUpvoteCount();

        // Resolve human-readable label for the issueTag from the controlled vocabulary
        String issueTagLabel = issueTypeRepository.findByStableKey(complaint.getIssueTag())
                .map(it -> it.getDisplayLabel())
                .orElse(complaint.getIssueTag()); // fallback for legacy data

        return ComplaintResponse.builder()
                .id(complaint.getId())
                .title(complaint.getTitle())
                .description(complaint.getDescription())
                .categoryId(complaint.getCategory().getId())
                .categoryName(complaint.getCategory().getName())
                .locationPath(complaint.getLocationPath())
                .issueTag(complaint.getIssueTag())
                .issueTagLabel(issueTagLabel)
                .studentId(complaint.getStudent().getId())
                .studentName(complaint.getStudent().getName())
                .status(complaint.getStatus())
                .adminNote(complaint.getAdminNote())
                .upvoteCount(upvoteCount)
                .priorityScore(complaint.getPriorityScore())
                .highPriority(upvoteCount >= 15)   // derived — never stored
                .hasUpvoted(hasUpvoted)
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .build();
    }
}
