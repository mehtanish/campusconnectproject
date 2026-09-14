package com.campuspulse.service;

import com.campuspulse.model.Complaint;
import com.campuspulse.model.Upvote;
import com.campuspulse.model.User;
import com.campuspulse.repository.ComplaintRepository;
import com.campuspulse.repository.UpvoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class UpvoteService {

    private final UpvoteRepository upvoteRepository;
    private final ComplaintRepository complaintRepository;
    private final ComplaintService complaintService;

    /**
     * Result record returned after a successful upvote, containing all three
     * priority fields in sync — always computed together, never stale.
     */
    public record UpvoteResult(int upvoteCount, double priorityScore, boolean highPriority) {}

    /**
     * Records the upvote and recalculates priority in the same transaction.
     * Throws RuntimeException (→ 409 via exception handler) if already upvoted.
     *
     * Returns the full priority triplet so the controller can echo it back
     * without an additional DB read.
     */
    @Transactional
    public UpvoteResult upvote(UUID complaintId, User student) {
        // Application-layer uniqueness guard (DB constraint is the second layer)
        if (upvoteRepository.existsByComplaintIdAndStudentId(complaintId, student.getId())) {
            throw new RuntimeException("You have already upvoted this complaint");
        }

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        Upvote upvote = Upvote.builder()
                .complaint(complaint)
                .student(student)
                .build();
        upvoteRepository.save(upvote);

        // Recalculate priority in the same transaction
        complaintService.recalculatePriority(complaintId);

        // Re-fetch the updated count (recalculatePriority writes to DB within this TX)
        long newCount = upvoteRepository.countByComplaintId(complaintId);
        double newScore = newCount * 1.5 + 1.0;
        boolean highPriority = newCount >= 15;

        return new UpvoteResult((int) newCount, newScore, highPriority);
    }

    public boolean hasUpvoted(UUID complaintId, UUID studentId) {
        return upvoteRepository.existsByComplaintIdAndStudentId(complaintId, studentId);
    }
}
