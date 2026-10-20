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
    private final com.campuspulse.repository.CommentRepository commentRepository;
    private final CommentService commentService;

    private static final double BASE_URGENCY = 1.0;
    private static final List<ComplaintStatus> ACTIVE_STATUSES = List.of(
            ComplaintStatus.PENDING, ComplaintStatus.ACCEPTED, ComplaintStatus.APPROVED, ComplaintStatus.IN_PROGRESS);

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

        String referenceId = generateNextReferenceId();

        Complaint complaint = Complaint.builder()
                .referenceId(referenceId)
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

    @Transactional(readOnly = true)
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

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getMyComplaints(User student) {
        return complaintRepository.findByStudentIdOrderByCreatedAtDesc(student.getId())
                .stream()
                .map(c -> toResponse(c, student.getId()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getUpvotedComplaints(User student) {
        return upvoteRepository.findByStudentIdOrderByCreatedAtDesc(student.getId())
                .stream()
                .map(upvote -> toResponse(
                        upvote.getComplaint(), student.getId(), true, upvote.getCreatedAt()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getAllComplaints(UUID currentUserId) {
        return complaintRepository.findAllByOrderByPriorityScoreDesc()
                .stream()
                .map(c -> toResponse(c, currentUserId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
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

    @Transactional(readOnly = true)
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

    @Transactional
    public void deleteComplaint(UUID complaintId, User user) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + complaintId));

        if (user.getRole() == Role.STUDENT) {
            if (!complaint.getStudent().getId().equals(user.getId())) {
                throw new AccessDeniedException("You are not authorized to delete another student's complaint");
            }
            if (complaint.getStatus() != ComplaintStatus.PENDING) {
                throw new IllegalStateException("Complaints can only be deleted while status is PENDING");
            }
        } else {
            if (!isAuthorizedAdminForCategory(complaint.getCategory(), user.getRole())) {
                throw new AccessDeniedException("You are not authorized to delete complaints outside your domain");
            }
        }

        commentRepository.deleteByComplaintId(complaintId);
        upvoteRepository.deleteByComplaintId(complaintId);
        complaintRepository.delete(complaint);
    }

    private boolean isAuthorizedAdminForCategory(Category category, Role adminRole) {
        if (adminRole == Role.SUPER_ADMIN) {
            return true;
        }
        Category current = category;
        while (current != null) {
            if (current.getAdminRole() == adminRole) {
                return true;
            }
            current = current.getParent();
        }
        return false;
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

        List<com.campuspulse.dto.comment.CommentResponse> comments = commentRepository
                .findByComplaintIdOrderByCreatedAtAsc(complaint.getId())
                .stream()
                .map(commentService::toResponse)
                .collect(Collectors.toList());

        return ComplaintResponse.builder()
                .id(complaint.getId())
                .referenceId(complaint.getReferenceId())
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
                .comments(comments)
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .build();
    }

    @Transactional
    public synchronized String generateNextReferenceId() {
        List<String> existing = complaintRepository.findAllReferenceIds();
        int maxNum = 1000;
        for (String ref : existing) {
            if (ref != null && ref.startsWith("CMP-") && ref.length() == 8) {
                try {
                    int num = Integer.parseInt(ref.substring(4));
                    if (num > maxNum) {
                        maxNum = num;
                    }
                } catch (NumberFormatException ignored) {}
            }
        }
        int nextNum = maxNum + 1;
        if (nextNum <= 9999) {
            return String.format("CMP-%04d", nextNum);
        } else {
            String suffix;
            do {
                suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 4).toUpperCase();
            } while (complaintRepository.existsByReferenceIdIgnoreCase("CMP-" + suffix));
            return "CMP-" + suffix;
        }
    }

    @Transactional(readOnly = true)
    public List<ComplaintActivityResponse> getLiveActivity() {
        return complaintRepository.findTop15ByOrderByUpdatedAtDesc()
                .stream()
                .map(this::toActivityResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ComplaintTrackResponse trackComplaint(String code) {
        if (code == null || code.isBlank()) {
            throw new com.campuspulse.exception.ResourceNotFoundException("Reference code must not be empty");
        }
        String clean = code.trim().replace("#", "");
        Complaint complaint = complaintRepository.findByReferenceIdIgnoreCase(clean)
                .orElseGet(() -> {
                    try {
                        UUID uuid = UUID.fromString(clean);
                        return complaintRepository.findById(uuid).orElse(null);
                    } catch (IllegalArgumentException e) {
                        return null;
                    }
                });

        if (complaint == null) {
            throw new com.campuspulse.exception.ResourceNotFoundException(
                    "Complaint ticket with reference code '" + code + "' was not found.");
        }

        return toTrackResponse(complaint);
    }

    public ComplaintActivityResponse toActivityResponse(Complaint complaint) {
        String building = extractBuilding(complaint.getLocationPath(),
                complaint.getCategory() != null ? complaint.getCategory().getName() : null);

        String refCode = complaint.getReferenceId();
        if (refCode == null || refCode.isBlank()) {
            refCode = "CMP-" + complaint.getId().toString().replace("-", "").substring(0, 4).toUpperCase();
        }

        return ComplaintActivityResponse.builder()
                .id(refCode)
                .referenceId(refCode)
                .complaintId(complaint.getId())
                .title(complaint.getTitle())
                .building(building)
                .locationPath(complaint.getLocationPath())
                .status(complaint.getStatus())
                .upvoteCount(complaint.getUpvoteCount())
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .build();
    }

    public ComplaintTrackResponse toTrackResponse(Complaint complaint) {
        String building = extractBuilding(complaint.getLocationPath(),
                complaint.getCategory() != null ? complaint.getCategory().getName() : null);

        String issueTagLabel = issueTypeRepository.findByStableKey(complaint.getIssueTag())
                .map(it -> it.getDisplayLabel())
                .orElse(complaint.getIssueTag());

        String refCode = complaint.getReferenceId();
        if (refCode == null || refCode.isBlank()) {
            refCode = "CMP-" + complaint.getId().toString().replace("-", "").substring(0, 4).toUpperCase();
        }

        return ComplaintTrackResponse.builder()
                .id(complaint.getId())
                .referenceId(refCode)
                .title(complaint.getTitle())
                .description(complaint.getDescription())
                .building(building)
                .locationPath(complaint.getLocationPath())
                .categoryName(complaint.getCategory() != null ? complaint.getCategory().getName() : "General")
                .issueTag(complaint.getIssueTag())
                .issueTagLabel(issueTagLabel)
                .status(complaint.getStatus())
                .adminNote(complaint.getAdminNote())
                .upvoteCount(complaint.getUpvoteCount())
                .priorityScore(complaint.getPriorityScore())
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .build();
    }

    public static String extractBuilding(String locationPath, String categoryName) {
        if (locationPath != null && !locationPath.isBlank()) {
            String[] parts = locationPath.split(">");
            if (parts.length > 1) {
                String first = parts[0].trim().toLowerCase();
                if (first.contains("block") || first.contains("hostel") || first.contains("zone")) {
                    String candidate = parts[1].trim();
                    if (!candidate.isEmpty()) return candidate;
                } else {
                    String candidate = parts[0].trim();
                    if (!candidate.isEmpty()) return candidate;
                }
            } else if (parts.length == 1) {
                String candidate = parts[0].trim();
                if (!candidate.isEmpty()) return candidate;
            }
        }
        if (categoryName != null && !categoryName.isBlank()) {
            return categoryName;
        }
        return "Campus Facility";
    }
}
