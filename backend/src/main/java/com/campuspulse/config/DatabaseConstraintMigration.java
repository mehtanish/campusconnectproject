package com.campuspulse.config;

import com.campuspulse.model.enums.ComplaintStatus;
import com.campuspulse.model.enums.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Reconciles database CHECK constraints with Java enums on startup.
 * Fixes code/schema drift (e.g. complaints_status_check missing ACCEPTED)
 * across both PostgreSQL and H2 databases.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
@Slf4j
public class DatabaseConstraintMigration implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        log.info("🔄 Running DatabaseConstraintMigration: Reconciling DB check constraints with application enums...");
        reconcileComplaintStatusCheck();
        reconcileUserRoleCheck();
        reconcileCategoryAdminRoleCheck();
        log.info("✅ DatabaseConstraintMigration completed successfully.");
    }

    private void reconcileComplaintStatusCheck() {
        String allowedStatuses = Arrays.stream(ComplaintStatus.values())
                .map(s -> "'" + s.name() + "'")
                .collect(Collectors.joining(", "));

        try {
            // Drop any anonymous or named check constraints on complaints.status if discoverable
            dropStatusCheckConstraintsOnComplaints();

            // Explicitly drop standard complaints_status_check
            jdbcTemplate.execute("ALTER TABLE complaints DROP CONSTRAINT IF EXISTS complaints_status_check");

            // Re-create constraint with full current enum set
            String ddl = "ALTER TABLE complaints ADD CONSTRAINT complaints_status_check CHECK (status IN (" + allowedStatuses + "))";
            jdbcTemplate.execute(ddl);

            log.info("✅ complaints_status_check reconciled with allowed values: [{}]",
                    Arrays.stream(ComplaintStatus.values()).map(Enum::name).collect(Collectors.joining(", ")));
        } catch (Exception e) {
            log.error("⚠️ Failed to reconcile complaints_status_check: {}", e.getMessage(), e);
        }
    }

    private void dropStatusCheckConstraintsOnComplaints() {
        try {
            // First drop explicit constraint by standard name
            try {
                jdbcTemplate.execute("ALTER TABLE complaints DROP CONSTRAINT IF EXISTS complaints_status_check");
            } catch (Exception ignored) {}

            // Query check constraints containing status in check clause (standard SQL / H2 / Postgres)
            try {
                List<String> constraintNames = jdbcTemplate.query(
                        "SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS WHERE UPPER(CHECK_CLAUSE) LIKE '%STATUS%'",
                        (rs, rowNum) -> rs.getString("CONSTRAINT_NAME")
                );

                for (String cName : constraintNames) {
                    if (cName != null) {
                        try {
                            jdbcTemplate.execute("ALTER TABLE complaints DROP CONSTRAINT IF EXISTS " + cName);
                            log.info("Dropped legacy status check constraint: {}", cName);
                        } catch (Exception ignored) {}
                    }
                }
            } catch (Exception ignored) {}

            // Query information_schema for check constraints on complaints table
            try {
                List<String> constraintNames = jdbcTemplate.query(
                        "SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS " +
                        "WHERE UPPER(TABLE_NAME) = 'COMPLAINTS' AND UPPER(CONSTRAINT_TYPE) = 'CHECK'",
                        (rs, rowNum) -> rs.getString("CONSTRAINT_NAME")
                );

                for (String cName : constraintNames) {
                    if (cName != null && cName.toLowerCase().contains("status")) {
                        try {
                            jdbcTemplate.execute("ALTER TABLE complaints DROP CONSTRAINT IF EXISTS " + cName);
                            log.info("Dropped legacy status check constraint: {}", cName);
                        } catch (Exception ignored) {}
                    }
                }
            } catch (Exception ignored) {}
        } catch (Exception ignored) {
            // information_schema structure can differ across DB vendors; proceed with standard drop
        }
    }

    private void reconcileUserRoleCheck() {
        String allowedRoles = Arrays.stream(Role.values())
                .map(r -> "'" + r.name() + "'")
                .collect(Collectors.joining(", "));

        try {
            jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
            String ddl = "ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN (" + allowedRoles + "))";
            jdbcTemplate.execute(ddl);
            log.info("✅ users_role_check reconciled with allowed values: [{}]",
                    Arrays.stream(Role.values()).map(Enum::name).collect(Collectors.joining(", ")));
        } catch (Exception e) {
            log.error("⚠️ Failed to reconcile users_role_check: {}", e.getMessage(), e);
        }
    }

    private void reconcileCategoryAdminRoleCheck() {
        String allowedRoles = Arrays.stream(Role.values())
                .map(r -> "'" + r.name() + "'")
                .collect(Collectors.joining(", "));

        try {
            jdbcTemplate.execute("ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_admin_role_check");
            String ddl = "ALTER TABLE categories ADD CONSTRAINT categories_admin_role_check CHECK (admin_role IN (" + allowedRoles + "))";
            jdbcTemplate.execute(ddl);
            log.info("✅ categories_admin_role_check reconciled with allowed values: [{}]",
                    Arrays.stream(Role.values()).map(Enum::name).collect(Collectors.joining(", ")));
        } catch (Exception e) {
            log.error("⚠️ Failed to reconcile categories_admin_role_check: {}", e.getMessage(), e);
        }
    }
}
