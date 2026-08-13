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
public class UpvoteService {

    private final UpvoteRepository upvoteRepository;
    private final ComplaintRepository complaintRepository;
    private final ComplaintService complaintService;

    @Transactional
    public int upvote(UUID complaintId, User student) {
        // Check if already upvoted
        if (upvoteRepository.existsByComplaintIdAndStudentId(complaintId, student.getId())) {
            throw new RuntimeException("You have already upvoted this complaint");
        }

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        // Create upvote record
        Upvote upvote = Upvote.builder()
                .complaint(complaint)
                .student(student)
                .build();
        upvoteRepository.save(upvote);

        // Recalculate priority
        complaintService.recalculatePriority(complaintId);

        // Return new count
        return (int) upvoteRepository.countByComplaintId(complaintId);
    }

    public boolean hasUpvoted(UUID complaintId, UUID studentId) {
        return upvoteRepository.existsByComplaintIdAndStudentId(complaintId, studentId);
    }
}
