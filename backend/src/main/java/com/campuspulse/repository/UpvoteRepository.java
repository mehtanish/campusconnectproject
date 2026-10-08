package com.campuspulse.repository;

import com.campuspulse.model.Upvote;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UpvoteRepository extends JpaRepository<Upvote, UUID> {

    boolean existsByComplaintIdAndStudentId(UUID complaintId, UUID studentId);

    long countByComplaintId(UUID complaintId);

    @EntityGraph(attributePaths = {"complaint", "complaint.category", "complaint.student"})
    List<Upvote> findByStudentIdOrderByCreatedAtDesc(UUID studentId);

    @EntityGraph(attributePaths = "student")
    @Query("SELECT u FROM Upvote u WHERE u.complaint.id = :complaintId ORDER BY u.createdAt ASC")
    List<Upvote> findByComplaintIdWithStudent(@Param("complaintId") UUID complaintId);

    java.util.Optional<Upvote> findByComplaintIdAndStudentId(UUID complaintId, UUID studentId);
}
