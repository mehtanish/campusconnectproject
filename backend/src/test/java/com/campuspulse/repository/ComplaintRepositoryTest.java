package com.campuspulse.repository;

import com.campuspulse.model.Category;
import com.campuspulse.model.Complaint;
import com.campuspulse.model.IssueType;
import com.campuspulse.model.Upvote;
import com.campuspulse.model.User;
import com.campuspulse.model.enums.ComplaintStatus;
import com.campuspulse.model.enums.Role;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
class ComplaintRepositoryTest {

    private static final List<ComplaintStatus> ACTIVE_STATUSES = List.of(
            ComplaintStatus.PENDING, ComplaintStatus.APPROVED, ComplaintStatus.IN_PROGRESS);

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

        @Autowired
        private IssueTypeRepository issueTypeRepository;

        @Autowired
        private UpvoteRepository upvoteRepository;

    @Test
    void findDuplicatesMatchesSameLocationAndIssueButIgnoresOtherIssuesAndClosedTickets() {
        User reporter = userRepository.save(User.builder()
                .name("Reporter")
                .email("reporter@example.test")
                .rollNo("CS1001")
                .passwordHash("encoded")
                .role(Role.STUDENT)
                .build());
        Category category = categoryRepository.save(Category.builder()
                .name("WiFi")
                .adminRole(Role.ADMIN_WIFI)
                .build());

        saveComplaint(reporter, category, "no-connectivity", ComplaintStatus.PENDING);
        saveComplaint(reporter, category, "slow-speed", ComplaintStatus.PENDING);
        saveComplaint(reporter, category, "no-connectivity", ComplaintStatus.RESOLVED);

        List<Complaint> duplicates = complaintRepository.findDuplicates(
                "BLOCK A > ROOM 12", "NO-CONNECTIVITY", ACTIVE_STATUSES);

        assertThat(duplicates)
                .extracting(Complaint::getIssueTag)
                .containsExactly("no-connectivity");
    }

    @Test
    void issueTypeLockQueryFindsTheSubmissionSerializationKey() {
        issueTypeRepository.save(IssueType.builder()
                .groupKey("wifi")
                .stableKey("no-connectivity")
                .displayLabel("No connectivity")
                .build());

        assertThat(issueTypeRepository.findByStableKeyForUpdate("no-connectivity"))
                .hasValueSatisfying(issueType ->
                        assertThat(issueType.getStableKey()).isEqualTo("no-connectivity"));
    }

    @Test
    void databaseRejectsDuplicateUpvotesForTheSameComplaintAndStudent() {
        User reporter = userRepository.save(User.builder()
                .name("Reporter")
                .email("unique-reporter@example.test")
                .rollNo("CS2001")
                .passwordHash("encoded")
                .role(Role.STUDENT)
                .build());
        Category category = categoryRepository.save(Category.builder()
                .name("WiFi")
                .adminRole(Role.ADMIN_WIFI)
                .build());
        Complaint complaint = complaintRepository.save(Complaint.builder()
                .title("No connectivity")
                .description("WiFi unavailable")
                .category(category)
                .locationPath("Block A")
                .issueTag("no-connectivity")
                .student(reporter)
                .status(ComplaintStatus.PENDING)
                .build());

        upvoteRepository.saveAndFlush(Upvote.builder().complaint(complaint).student(reporter).build());
        upvoteRepository.save(Upvote.builder().complaint(complaint).student(reporter).build());

        assertThatThrownBy(upvoteRepository::flush).isInstanceOf(RuntimeException.class);
    }

    private void saveComplaint(User reporter, Category category, String issueTag, ComplaintStatus status) {
        complaintRepository.save(Complaint.builder()
                .title("Test complaint")
                .description("Test description")
                .category(category)
                .locationPath("Block A > Room 12")
                .issueTag(issueTag)
                .student(reporter)
                .status(status)
                .build());
    }
}