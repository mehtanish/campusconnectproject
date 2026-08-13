package com.campuspulse.repository;

import com.campuspulse.model.Upvote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UpvoteRepository extends JpaRepository<Upvote, UUID> {

    boolean existsByComplaintIdAndStudentId(UUID complaintId, UUID studentId);

    long countByComplaintId(UUID complaintId);
}
