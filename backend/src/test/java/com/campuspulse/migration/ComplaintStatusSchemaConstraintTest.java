package com.campuspulse.migration;

import com.campuspulse.exception.GlobalExceptionHandler;
import com.campuspulse.model.Category;
import com.campuspulse.model.Complaint;
import com.campuspulse.model.User;
import com.campuspulse.model.enums.ComplaintStatus;
import com.campuspulse.model.enums.Role;
import com.campuspulse.repository.CategoryRepository;
import com.campuspulse.repository.ComplaintRepository;
import com.campuspulse.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.sql.SQLException;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@SuppressWarnings("null")
public class ComplaintStatusSchemaConstraintTest {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private GlobalExceptionHandler globalExceptionHandler;

    @Test
    @DisplayName("Assert every value in ComplaintStatus enum is permitted by database check constraint")
    @Transactional
    void everyComplaintStatusEnumPermittedByDatabaseConstraint() {
        User testStudent = userRepository.save(User.builder()
                .name("Test Schema Student")
                .email("schematest_" + UUID.randomUUID() + "@pict.edu")
                .rollNo("ST_" + UUID.randomUUID().toString().substring(0, 6))
                .passwordHash("hash")
                .role(Role.STUDENT)
                .build());

        Category testCategory = categoryRepository.save(Category.builder()
                .name("Schema Test Category")
                .adminRole(Role.ADMIN_MAINTENANCE)
                .build());

        Complaint complaint = complaintRepository.save(Complaint.builder()
                .title("Schema Test Issue")
                .description("Verifying all ComplaintStatus enum values")
                .locationPath("Hostel > Wing A")
                .student(testStudent)
                .category(testCategory)
                .status(ComplaintStatus.PENDING)
                .build());

        // Iterate through EVERY enum value defined in the application
        for (ComplaintStatus status : ComplaintStatus.values()) {
            complaint.setStatus(status);
            Complaint updated = complaintRepository.saveAndFlush(complaint);
            assertThat(updated.getStatus())
                    .as("Database must permit status: " + status.name())
                    .isEqualTo(status);

            // Also verify raw SQL update directly on the database table
            int rowsUpdated = jdbcTemplate.update(
                    "UPDATE complaints SET status = ? WHERE id = ?",
                    status.name(), complaint.getId());
            assertThat(rowsUpdated).isEqualTo(1);
        }
    }

    @Test
    @DisplayName("Assert database check constraint rejects invalid status values")
    @Transactional
    void databaseRejectsInvalidStatusValues() {
        User testStudent = userRepository.save(User.builder()
                .name("Test Student Invalid")
                .email("invalidstatus_" + UUID.randomUUID() + "@pict.edu")
                .rollNo("INV_" + UUID.randomUUID().toString().substring(0, 6))
                .passwordHash("hash")
                .role(Role.STUDENT)
                .build());

        Category testCategory = categoryRepository.save(Category.builder()
                .name("Schema Category")
                .adminRole(Role.ADMIN_WIFI)
                .build());

        Complaint complaint = complaintRepository.saveAndFlush(Complaint.builder()
                .title("Constraint Enforcement Test")
                .description("Ensuring database rejects arbitrary status")
                .locationPath("Campus > Library")
                .student(testStudent)
                .category(testCategory)
                .status(ComplaintStatus.PENDING)
                .build());

        // Direct SQL update with an unpermitted value must trigger check constraint violation
        assertThatThrownBy(() -> jdbcTemplate.update(
                "UPDATE complaints SET status = 'INVALID_STATUS' WHERE id = ?",
                complaint.getId()))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @DisplayName("Assert all Role enum values are permitted for users.role and categories.admin_role")
    @Transactional
    void everyRoleEnumPermittedByDatabaseConstraint() {
        for (Role role : Role.values()) {
            User u = userRepository.saveAndFlush(User.builder()
                    .name("User " + role.name())
                    .email("user_" + role.name().toLowerCase() + "_" + UUID.randomUUID() + "@pict.edu")
                    .rollNo("RL_" + UUID.randomUUID().toString().substring(0, 6))
                    .passwordHash("hash")
                    .role(role)
                    .build());
            assertThat(u.getRole()).isEqualTo(role);

            Category c = categoryRepository.saveAndFlush(Category.builder()
                    .name("Cat " + role.name())
                    .adminRole(role)
                    .build());
            assertThat(c.getAdminRole()).isEqualTo(role);
        }
    }

    @Test
    @DisplayName("Assert GlobalExceptionHandler never leaks SQL text, constraint names, or PII in client response")
    void globalExceptionHandlerSanitizesDataIntegrityViolation() {
        String sensitivePiiAndSql = "ERROR: new row for relation \"complaints\" violates check constraint \"complaints_status_check\"\n" +
                "Detail: Failing row contains (id=42, student_name=Johnathan Doe, roll_no=CS1049, " +
                "title=Broken router in room 302, description=Secret student grievance, status=ACCEPTED).";

        DataIntegrityViolationException ex = new DataIntegrityViolationException(
                "Could not execute statement",
                new SQLException(sensitivePiiAndSql));

        ResponseEntity<Map<String, Object>> response = globalExceptionHandler.handleDataConflict(ex);

        assertThat(response.getStatusCode().value()).isEqualTo(409);
        Map<String, Object> body = response.getBody();
        assertThat(body).isNotNull();

        String message = (String) body.get("message");
        String error = (String) body.get("error");

        // Must be a user-safe generic message
        assertThat(message).isEqualTo("Unable to update complaint status. Please try again or contact support.");
        assertThat(error).isEqualTo("Unable to update complaint status. Please try again or contact support.");

        // Must NEVER contain raw SQL, constraint names, or PII
        assertThat(message).doesNotContain("complaints_status_check");
        assertThat(message).doesNotContain("Johnathan Doe");
        assertThat(message).doesNotContain("CS1049");
        assertThat(message).doesNotContain("Broken router");
        assertThat(message).doesNotContain("Failing row contains");
        assertThat(message).doesNotContain("ERROR:");
    }
}
