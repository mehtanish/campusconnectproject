package com.campuspulse.service;

import com.campuspulse.dto.complaint.UpvoteResponse;
import com.campuspulse.exception.ConflictException;
import com.campuspulse.model.Complaint;
import com.campuspulse.model.Upvote;
import com.campuspulse.model.User;
import com.campuspulse.repository.ComplaintRepository;
import com.campuspulse.repository.UpvoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class UpvoteService {

    private final UpvoteRepository upvoteRepository;
    private final ComplaintRepository complaintRepository;

    /** Adds/removes votes under a complaint-row lock; the unique key is the final safeguard. */
    @Transactional
    public UpvoteResponse upvote(UUID complaintId, User student) {
        Complaint complaint = complaintRepository.findByIdForUpdate(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        ensureEligibleForVoting(complaint);

        if (upvoteRepository.existsByComplaintIdAndStudentId(complaintId, student.getId())) {
            throw new ConflictException("You have already upvoted this issue.");
        }

        Upvote upvote = Upvote.builder()
                .complaint(complaint)
                .student(student)
                .build();
        try {
            upvoteRepository.save(upvote);
            upvoteRepository.flush();
        } catch (DataIntegrityViolationException exception) {
            throw new ConflictException("You have already upvoted this issue.");
        }

        return updateCountAndBuildResponse(complaint, true, "Issue upvoted successfully.");
    }

    @Transactional
    public UpvoteResponse removeUpvote(UUID complaintId, User student) {
        Complaint complaint = complaintRepository.findByIdForUpdate(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        Upvote upvote = upvoteRepository.findByComplaintIdAndStudentId(complaintId, student.getId())
                .orElseThrow(() -> new ConflictException("You have not upvoted this issue."));

        upvoteRepository.delete(upvote);
        upvoteRepository.flush();

        return updateCountAndBuildResponse(complaint, false, "Upvote removed successfully.");
    }

    private void ensureEligibleForVoting(Complaint complaint) {
        if (complaint.getStatus() == com.campuspulse.model.enums.ComplaintStatus.RESOLVED
                || complaint.getStatus() == com.campuspulse.model.enums.ComplaintStatus.REJECTED) {
            throw new ConflictException("This issue is no longer open for upvoting.");
        }
    }

    private UpvoteResponse updateCountAndBuildResponse(
            Complaint complaint, boolean hasUpvoted, String message) {
        long count = upvoteRepository.countByComplaintId(complaint.getId());
        complaint.setUpvoteCount(Math.toIntExact(count));
        complaint.setPriorityScore(count * 1.5 + 1.0);
        complaintRepository.save(complaint);

        return UpvoteResponse.builder()
                .success(true)
                .message(message)
                .upvoteCount(complaint.getUpvoteCount())
                .priorityScore(complaint.getPriorityScore())
                .highPriority(count >= 15)
                .hasUpvoted(hasUpvoted)
                .build();
    }

    public boolean hasUpvoted(UUID complaintId, UUID studentId) {
        return upvoteRepository.existsByComplaintIdAndStudentId(complaintId, studentId);
    }
}
