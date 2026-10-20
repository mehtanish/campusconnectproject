package com.campuspulse.service;

import com.campuspulse.dto.comment.CommentRequest;
import com.campuspulse.dto.comment.CommentResponse;
import com.campuspulse.model.Comment;
import com.campuspulse.model.Complaint;
import com.campuspulse.model.User;
import com.campuspulse.model.enums.Role;
import com.campuspulse.repository.CommentRepository;
import com.campuspulse.repository.ComplaintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class CommentService {

    private final CommentRepository commentRepository;
    private final ComplaintRepository complaintRepository;

    @Transactional
    public CommentResponse addComment(UUID complaintId, CommentRequest request, User author) {
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("Comment content cannot be blank");
        }

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + complaintId));

        Comment comment = Comment.builder()
                .complaint(complaint)
                .author(author)
                .content(request.getContent().trim())
                .build();

        comment = commentRepository.save(comment);
        return toResponse(comment);
    }

    @Transactional
    public void deleteComment(UUID commentId, User user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + commentId));

        boolean isAdmin = user.getRole() != Role.STUDENT;
        boolean isAuthor = comment.getAuthor().getId().equals(user.getId());

        if (!isAdmin && !isAuthor) {
            throw new AccessDeniedException("You are not authorized to delete this comment");
        }

        commentRepository.delete(comment);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByComplaint(UUID complaintId) {
        return commentRepository.findByComplaintIdOrderByCreatedAtAsc(complaintId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CommentResponse toResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .complaintId(comment.getComplaint().getId())
                .authorId(comment.getAuthor().getId())
                .authorName(comment.getAuthor().getName())
                .authorRole(comment.getAuthor().getRole())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
