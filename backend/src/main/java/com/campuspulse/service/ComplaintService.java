package com.campuspulse.service;

import com.campuspulse.dto.complaint.*;
import com.campuspulse.exception.DuplicateComplaintException;
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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private static final List<ComplaintStatus> ACTIVE_STATUSES = List.of(
            ComplaintStatus.PENDING, ComplaintStatus.APPROVED, ComplaintStatus.IN_PROGRESS);

    @Transactional
    public ComplaintResponse createComplaint(ComplaintRequest request, User student) {
        // Validate issueTag against the controlled vocabulary before anything else
        issueTypeService.validateStableKey(request.getIssueTag());
        issueTypeRepository.findByStableKeyForUpdate(request.getIssueTag())
            .orElseThrow(() -> new IllegalArgumentException(
                "Unknown issueTag: '" + request.getIssueTag() + "'"));

        List<Complaint> duplicates = complaintRepository.findDuplicates(
                request.getLocationPath(), request.getIssueTag(), ACTIVE_STATUSES);
        if (!duplicates.isEmpty()) {
            throw new DuplicateComplaintException(toResponse(duplicates.get(0), student.getId()));
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

    public DuplicateCheckResponse checkDuplicate(DuplicateCheckRequest request, UUID currentUserId) {
        if (request.getLocationPath() == null || request.getLocationPath().isBlank()
                || request.getIssueTag() == null || request.getIssueTag().isBlank()) {
            return DuplicateCheckResponse.builder().isDuplicate(false).build();
        }

        List<Complaint> duplicates = complaintRepository.findDuplicates(
                request.getLocationPath(), request.getIssueTag(), ACTIVE_STATUSES);

        if (!duplicates.isEmpty()) {
            Complaint existing = duplicates.get(0);
            return DuplicateCheckResponse.builder()
                    .isDuplicate(true)
                    .existingComplaint(toResponse(existing, currentUserId))
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
        return upvoteRepository.findByStudentIdOrderByCreatedAtDesc(student.getId())
                .stream()
                .map(upvote -> toResponse(
                        upvote.getComplaint(), student.getId(), true, upvote.getCreatedAt()))
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

    @Transactional(readOnly = true)
    public AdminComplaintDetailResponse getAdminComplaintDetails(UUID id, Role adminRole) {
        if (adminRole != Role.SUPER_ADMIN && !complaintRepository.existsByIdAndAdminRole(id, adminRole)) {
            throw new AccessDeniedException("You are not authorized to view this complaint.");
        }

        Complaint complaint = complaintRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Complaint not found"));
        AdminComplaintDetailResponse.Reporter reporter = new AdminComplaintDetailResponse.Reporter(
                complaint.getStudent().getId(),
                complaint.getStudent().getName(),
                complaint.getStudent().getEmail());
        List<AdminComplaintDetailResponse.Upvoter> upvoters = upvoteRepository
                .findByComplaintIdWithStudent(id)
                .stream()
                .map(upvote -> new AdminComplaintDetailResponse.Upvoter(
                        new AdminComplaintDetailResponse.Reporter(
                                upvote.getStudent().getId(),
                                upvote.getStudent().getName(),
                                upvote.getStudent().getEmail()),
                        upvote.getCreatedAt()))
                .collect(Collectors.toList());

        return new AdminComplaintDetailResponse(
                complaint.getId(),
                complaint.getTitle(),
                complaint.getDescription(),
                complaint.getStatus(),
                complaint.getUpvoteCount(),
                reporter,
                upvoters,
                complaint.getCreatedAt(),
                complaint.getUpdatedAt());
    }

    /**
     * Builds the complaint response, computing all three priority fields in sync:
     * upvoteCount, priorityScore, and highPriority (derived: upvoteCount >= 15).
     */
    ComplaintResponse toResponse(Complaint complaint, UUID currentUserId) {
        boolean hasUpvoted = currentUserId != null && upvoteRepository.existsByComplaintIdAndStudentId(
                complaint.getId(), currentUserId);
        return toResponse(complaint, currentUserId, hasUpvoted, null);
    }

    private ComplaintResponse toResponse(
            Complaint complaint, UUID currentUserId, boolean hasUpvoted,
            java.time.LocalDateTime upvotedAt) {
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
                .upvotedAt(upvotedAt)
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .build();
    }
}
