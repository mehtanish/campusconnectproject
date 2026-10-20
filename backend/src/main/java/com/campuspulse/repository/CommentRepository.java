package com.campuspulse.repository;

import com.campuspulse.model.Comment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {

    @EntityGraph(attributePaths = {"author"})
    List<Comment> findByComplaintIdOrderByCreatedAtAsc(UUID complaintId);

    @Modifying
    @Query("DELETE FROM Comment c WHERE c.complaint.id = :complaintId")
    void deleteByComplaintId(@Param("complaintId") UUID complaintId);
}
