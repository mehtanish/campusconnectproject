package com.campuspulse.repository;

import com.campuspulse.model.Complaint;
import com.campuspulse.model.enums.ComplaintStatus;
import com.campuspulse.model.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, UUID> {

    /** Student's own complaints */
    List<Complaint> findByStudentIdOrderByCreatedAtDesc(UUID studentId);

    /** All complaints for a given status */
    List<Complaint> findByStatusOrderByPriorityScoreDesc(ComplaintStatus status);

    /** Admin domain-filtered: get complaints for categories with matching admin role */
    @Query("SELECT c FROM Complaint c WHERE c.category.adminRole = :role ORDER BY c.priorityScore DESC")
    List<Complaint> findByAdminRoleOrderByPriorityDesc(@Param("role") Role role);

    /** Deduplication check: find active complaints matching location and issue tag */
    @Query("SELECT c FROM Complaint c WHERE c.locationPath = :locationPath " +
           "AND c.issueTag = :issueTag " +
           "AND c.status IN :statuses")
    List<Complaint> findDuplicates(
        @Param("locationPath") String locationPath,
        @Param("issueTag") String issueTag,
        @Param("statuses") List<ComplaintStatus> statuses
    );

    /** Count by status for analytics */
    long countByStatus(ComplaintStatus status);

    /** Count by category admin role for domain-specific stats */
    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.category.adminRole = :role")
    long countByAdminRole(@Param("role") Role role);

    /** All complaints ordered by priority (admin view) */
    List<Complaint> findAllByOrderByPriorityScoreDesc();
}
