package com.campuspulse.repository;

import com.campuspulse.model.Complaint;
import com.campuspulse.model.enums.ComplaintStatus;
import com.campuspulse.model.enums.Role;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Complaint c WHERE c.id = :id")
    java.util.Optional<Complaint> findByIdForUpdate(@Param("id") UUID id);

    /** Student's own complaints */
    List<Complaint> findByStudentIdOrderByCreatedAtDesc(UUID studentId);

    /** All complaints for a given status */
    List<Complaint> findByStatusOrderByPriorityScoreDesc(ComplaintStatus status);

    /** Admin domain-filtered: get complaints where leaf category or any ancestor category has matching admin role */
    @Query("SELECT c FROM Complaint c WHERE " +
           "c.category.adminRole = :role OR " +
           "(c.category.parent IS NOT NULL AND c.category.parent.adminRole = :role) OR " +
           "(c.category.parent.parent IS NOT NULL AND c.category.parent.parent.adminRole = :role) OR " +
           "(c.category.parent.parent.parent IS NOT NULL AND c.category.parent.parent.parent.adminRole = :role) OR " +
           "(c.category.parent.parent.parent.parent IS NOT NULL AND c.category.parent.parent.parent.parent.adminRole = :role) " +
           "ORDER BY c.priorityScore DESC")
    List<Complaint> findByAdminRoleOrderByPriorityDesc(@Param("role") Role role);

        @Query("SELECT CASE WHEN COUNT(c) > 0 THEN TRUE ELSE FALSE END FROM Complaint c WHERE c.id = :id AND " +
            "(c.category.adminRole = :role OR " +
            "(c.category.parent IS NOT NULL AND c.category.parent.adminRole = :role) OR " +
            "(c.category.parent.parent IS NOT NULL AND c.category.parent.parent.adminRole = :role) OR " +
            "(c.category.parent.parent.parent IS NOT NULL AND c.category.parent.parent.parent.adminRole = :role) OR " +
            "(c.category.parent.parent.parent.parent IS NOT NULL AND c.category.parent.parent.parent.parent.adminRole = :role))")
        boolean existsByIdAndAdminRole(@Param("id") UUID id, @Param("role") Role role);




    /** Find active complaints for the same issue type at the same location. */
    @Query("SELECT c FROM Complaint c WHERE LOWER(c.locationPath) = LOWER(:locationPath) " +
           "AND LOWER(c.issueTag) = LOWER(:issueTag) " +
           "AND c.status IN :statuses ORDER BY c.createdAt ASC")
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
