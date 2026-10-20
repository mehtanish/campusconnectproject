package com.campuspulse.service;

import com.campuspulse.dto.comment.CommentRequest;
import com.campuspulse.dto.comment.CommentResponse;
import com.campuspulse.dto.complaint.ComplaintRequest;
import com.campuspulse.dto.complaint.ComplaintResponse;
import com.campuspulse.dto.complaint.StatusUpdateRequest;
import com.campuspulse.model.*;
import com.campuspulse.model.enums.ComplaintStatus;
import com.campuspulse.model.enums.Role;
import com.campuspulse.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
@SuppressWarnings("null")
class ComplaintServiceTest {

    @Autowired
    private ComplaintService complaintService;

    @Autowired
    private CommentService commentService;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IssueTypeRepository issueTypeRepository;

    @Autowired
    private CommentRepository commentRepository;

    private User student1;
    private User student2;
    private User wifiAdmin;
    private User superAdmin;
    private Category wifiCategory;

    @BeforeEach
    void setUp() {
        student1 = userRepository.save(User.builder()
                .name("Student One")
                .email("student1@pict.edu")
                .rollNo("STU001")
                .passwordHash("hash")
                .role(Role.STUDENT)
                .build());

        student2 = userRepository.save(User.builder()
                .name("Student Two")
                .email("student2@pict.edu")
                .rollNo("STU002")
                .passwordHash("hash")
                .role(Role.STUDENT)
                .build());

        wifiAdmin = userRepository.save(User.builder()
                .name("WiFi Admin")
                .email("admin.wifi@pict.edu")
                .rollNo("ADM001")
                .passwordHash("hash")
                .role(Role.ADMIN_WIFI)
                .build());

        superAdmin = userRepository.save(User.builder()
                .name("Super Admin")
                .email("super@pict.edu")
                .rollNo("SUP001")
                .passwordHash("hash")
                .role(Role.SUPER_ADMIN)
                .build());

        wifiCategory = categoryRepository.save(Category.builder()
                .name("Campus WiFi")
                .adminRole(Role.ADMIN_WIFI)
                .build());

        if (issueTypeRepository.findByStableKey("test-wifi-issue").isEmpty()) {
            issueTypeRepository.save(IssueType.builder()
                    .stableKey("test-wifi-issue")
                    .displayLabel("Test WiFi Issue")
                    .groupKey("wifi")
                    .build());
        }
    }

    private Complaint createTestComplaint(User author, ComplaintStatus status) {
        return complaintRepository.save(Complaint.builder()
                .title("WiFi Down in Lab 1")
                .description("No connection on floor 1")
                .category(wifiCategory)
                .locationPath("Academic > Floor 1")
                .issueTag("test-wifi-issue")
                .student(author)
                .status(status)
                .upvoteCount(2)
                .priorityScore(4.0)
                .build());
    }

    @Test
    void studentCanDeleteOwnPendingComplaint() {
        Complaint complaint = createTestComplaint(student1, ComplaintStatus.PENDING);

        complaintService.deleteComplaint(complaint.getId(), student1);

        assertThat(complaintRepository.findById(complaint.getId())).isEmpty();
    }

    @Test
    void studentCannotDeleteAnotherStudentsComplaint() {
        Complaint complaint = createTestComplaint(student1, ComplaintStatus.PENDING);

        assertThatThrownBy(() -> complaintService.deleteComplaint(complaint.getId(), student2))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void studentCannotDeleteComplaintOnceAcceptedOrInProgressOrResolved() {
        Complaint accepted = createTestComplaint(student1, ComplaintStatus.ACCEPTED);
        Complaint inProgress = createTestComplaint(student1, ComplaintStatus.IN_PROGRESS);
        Complaint resolved = createTestComplaint(student1, ComplaintStatus.RESOLVED);

        assertThatThrownBy(() -> complaintService.deleteComplaint(accepted.getId(), student1))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("PENDING");

        assertThatThrownBy(() -> complaintService.deleteComplaint(inProgress.getId(), student1))
                .isInstanceOf(IllegalStateException.class);

        assertThatThrownBy(() -> complaintService.deleteComplaint(resolved.getId(), student1))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void adminCanDeletePendingOrActiveComplaint() {
        Complaint complaint = createTestComplaint(student1, ComplaintStatus.PENDING);

        complaintService.deleteComplaint(complaint.getId(), wifiAdmin);

        assertThat(complaintRepository.findById(complaint.getId())).isEmpty();
    }

    @Test
    void adminCanAddCommentAndStudentCanSeeIt() {
        Complaint complaint = createTestComplaint(student1, ComplaintStatus.PENDING);

        CommentResponse commentRes = commentService.addComment(
                complaint.getId(),
                new CommentRequest("Technician has been dispatched to Lab 1."),
                wifiAdmin
        );

        assertThat(commentRes.getContent()).isEqualTo("Technician has been dispatched to Lab 1.");
        assertThat(commentRes.getAuthorName()).isEqualTo("WiFi Admin");
        assertThat(commentRes.getAuthorRole()).isEqualTo(Role.ADMIN_WIFI);

        // Fetch complaint from student perspective
        List<ComplaintResponse> studentComplaints = complaintService.getMyComplaints(student1);
        ComplaintResponse myComplaint = studentComplaints.stream()
                .filter(c -> c.getId().equals(complaint.getId()))
                .findFirst().orElseThrow();

        assertThat(myComplaint.getComments()).hasSize(1);
        assertThat(myComplaint.getComments().get(0).getContent())
                .isEqualTo("Technician has been dispatched to Lab 1.");
    }

    @Test
    void adminCanModerateAndDeleteIndividualComments() {
        Complaint complaint = createTestComplaint(student1, ComplaintStatus.PENDING);

        CommentResponse c1 = commentService.addComment(
                complaint.getId(),
                new CommentRequest("Spam comment here"),
                student2
        );

        // Admin moderates and deletes the comment
        commentService.deleteComment(c1.getId(), wifiAdmin);

        assertThat(commentRepository.findById(c1.getId())).isEmpty();
        // Complaint remains intact
        assertThat(complaintRepository.findById(complaint.getId())).isPresent();
    }

    @Test
    void complaintCreationGeneratesEightCharReferenceId() {
        ComplaintRequest request = new ComplaintRequest();
        request.setTitle("Water Cooler Broken in Library");
        request.setDescription("Water leakage on floor 2 near entrance");
        request.setCategoryId(wifiCategory.getId());
        request.setLocationPath("Academic > Library > Floor 2");
        request.setIssueTag("test-wifi-issue");

        ComplaintResponse response = complaintService.createComplaint(request, student1);

        assertThat(response.getReferenceId()).isNotNull();
        assertThat(response.getReferenceId()).startsWith("CMP-");
        assertThat(response.getReferenceId()).hasSize(8);
        assertThat(response.getReferenceCode()).isEqualTo(response.getReferenceId());
    }

    @Test
    void liveActivityStreamAndTrackComplaintLookup() {
        Complaint complaint = createTestComplaint(student1, ComplaintStatus.IN_PROGRESS);
        complaint.setReferenceId("CMP-9901");
        complaintRepository.save(complaint);

        // Test Live Activity Stream
        List<com.campuspulse.dto.complaint.ComplaintActivityResponse> activities = complaintService.getLiveActivity();
        assertThat(activities).isNotEmpty();
        assertThat(activities.stream().anyMatch(a -> "CMP-9901".equals(a.getReferenceId()))).isTrue();

        // Test Track Lookup by exact reference
        com.campuspulse.dto.complaint.ComplaintTrackResponse track = complaintService.trackComplaint("CMP-9901");
        assertThat(track.getReferenceId()).isEqualTo("CMP-9901");
        assertThat(track.getTitle()).isEqualTo("WiFi Down in Lab 1");
        assertThat(track.getStatus()).isEqualTo(ComplaintStatus.IN_PROGRESS);

        // Test Track Lookup case-insensitive with leading hash
        com.campuspulse.dto.complaint.ComplaintTrackResponse trackHash = complaintService.trackComplaint("#cmp-9901");
        assertThat(trackHash.getReferenceId()).isEqualTo("CMP-9901");

        // Test Track Lookup by UUID
        com.campuspulse.dto.complaint.ComplaintTrackResponse trackUuid = complaintService.trackComplaint(complaint.getId().toString());
        assertThat(trackUuid.getReferenceId()).isEqualTo("CMP-9901");

        // Test Track Lookup for non-existent code
        org.junit.jupiter.api.Assertions.assertThrows(
                com.campuspulse.exception.ResourceNotFoundException.class,
                () -> complaintService.trackComplaint("CMP-0000")
        );
    }

    @Test
    void studentCannotUpdateComplaintStatus() {
        Complaint complaint = createTestComplaint(student1, ComplaintStatus.PENDING);
        StatusUpdateRequest update = new StatusUpdateRequest();
        update.setStatus(ComplaintStatus.IN_PROGRESS);
        update.setAdminNote("Attempted student update");

        org.junit.jupiter.api.Assertions.assertThrows(
                org.springframework.security.access.AccessDeniedException.class,
                () -> complaintService.updateStatus(complaint.getId(), update, student1)
        );
    }

    @Test
    void studentCannotGetComplaintsByAdminRole() {
        org.junit.jupiter.api.Assertions.assertThrows(
                org.springframework.security.access.AccessDeniedException.class,
                () -> complaintService.getComplaintsByAdminRole(student1.getRole(), student1.getId())
        );
    }

    @Test
    void duplicateComplaintDetectionAllowsDifferentTitlesAtSameLocation() {
        ComplaintRequest req1 = new ComplaintRequest();
        req1.setTitle("Projector dead in Lab 201");
        req1.setDescription("Lamp is blown and needs immediate replacement");
        req1.setCategoryId(wifiCategory.getId());
        req1.setLocationPath("Academic > A3 Building > Floor 2");
        req1.setIssueTag("test-wifi-issue");

        ComplaintResponse res1 = complaintService.createComplaint(req1, student1);
        assertThat(res1.getId()).isNotNull();

        // Second complaint at same location + same issueTag, but different title/room
        ComplaintRequest req2 = new ComplaintRequest();
        req2.setTitle("HDMI cable missing in Lab 205");
        req2.setDescription("Cable was removed and cannot connect laptop");
        req2.setCategoryId(wifiCategory.getId());
        req2.setLocationPath("Academic > A3 Building > Floor 2");
        req2.setIssueTag("test-wifi-issue");

        // Should submit cleanly with no conflict error
        ComplaintResponse res2 = complaintService.createComplaint(req2, student2);
        assertThat(res2.getId()).isNotNull();
        assertThat(res2.getId()).isNotEqualTo(res1.getId());

        // Exact duplicate title & location by student1 should be blocked
        ComplaintRequest reqDuplicate = new ComplaintRequest();
        reqDuplicate.setTitle("Projector dead in Lab 201");
        reqDuplicate.setDescription("Lamp is blown and needs immediate replacement");
        reqDuplicate.setCategoryId(wifiCategory.getId());
        reqDuplicate.setLocationPath("Academic > A3 Building > Floor 2");
        reqDuplicate.setIssueTag("test-wifi-issue");

        org.junit.jupiter.api.Assertions.assertThrows(
                com.campuspulse.exception.DuplicateComplaintException.class,
                () -> complaintService.createComplaint(reqDuplicate, student1)
        );
    }
}
