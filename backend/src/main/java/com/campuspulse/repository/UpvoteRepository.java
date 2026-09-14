package com.campuspulse.repository;

import com.campuspulse.model.Complaint;
import com.campuspulse.model.Upvote;
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

    @Query("SELECT u.complaint FROM Upvote u WHERE u.student.id = :studentId ORDER BY u.createdAt DESC")
    List<Complaint> findUpvotedComplaintsByStudentId(@Param("studentId") UUID studentId);
}
