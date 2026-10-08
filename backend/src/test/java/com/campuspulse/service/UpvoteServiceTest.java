package com.campuspulse.service;

import com.campuspulse.exception.ConflictException;
import com.campuspulse.model.Complaint;
import com.campuspulse.model.Upvote;
import com.campuspulse.model.User;
import com.campuspulse.model.enums.ComplaintStatus;
import com.campuspulse.repository.ComplaintRepository;
import com.campuspulse.repository.UpvoteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class UpvoteServiceTest {

    @Mock
    private UpvoteRepository upvoteRepository;

    @Mock
    private ComplaintRepository complaintRepository;

    @InjectMocks
    private UpvoteService upvoteService;

    private Complaint complaint;
    private User user;

    @BeforeEach
    void setUp() {
        complaint = Complaint.builder()
                .id(UUID.randomUUID())
                .status(ComplaintStatus.PENDING)
                .upvoteCount(0)
                .build();
        user = User.builder().id(UUID.randomUUID()).build();
        when(complaintRepository.findByIdForUpdate(complaint.getId())).thenReturn(Optional.of(complaint));
    }

    @Test
    void upvoteCreatesRecordAndSynchronizesCount() {
        when(upvoteRepository.existsByComplaintIdAndStudentId(complaint.getId(), user.getId()))
                .thenReturn(false);
        when(upvoteRepository.countByComplaintId(complaint.getId())).thenReturn(1L);

        var response = upvoteService.upvote(complaint.getId(), user);

        verify(upvoteRepository).save(any(Upvote.class));
        verify(upvoteRepository).flush();
        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getUpvoteCount()).isEqualTo(1);
        assertThat(response.isHasUpvoted()).isTrue();
        assertThat(complaint.getPriorityScore()).isEqualTo(2.5);
    }

    @Test
    void duplicateUpvoteReturnsConflictWithoutAddingAnotherRecord() {
        when(upvoteRepository.existsByComplaintIdAndStudentId(complaint.getId(), user.getId()))
                .thenReturn(true);

        assertThatThrownBy(() -> upvoteService.upvote(complaint.getId(), user))
                .isInstanceOf(ConflictException.class)
                .hasMessage("You have already upvoted this issue.");
        verify(upvoteRepository, never()).save(any(Upvote.class));
    }

    @Test
    void removeUpvoteDeletesRecordAndRecalculatesCount() {
        when(upvoteRepository.findByComplaintIdAndStudentId(complaint.getId(), user.getId()))
                .thenReturn(Optional.of(Upvote.builder().build()));
        when(upvoteRepository.countByComplaintId(complaint.getId())).thenReturn(0L);

        var response = upvoteService.removeUpvote(complaint.getId(), user);

        verify(upvoteRepository).delete(any(Upvote.class));
        verify(upvoteRepository).flush();
        assertThat(response.getUpvoteCount()).isZero();
        assertThat(response.isHasUpvoted()).isFalse();
        assertThat(complaint.getPriorityScore()).isEqualTo(1.0);
    }

    @Test
    void removingMissingUpvoteReturnsConflictAndDoesNotReduceCount() {
        when(upvoteRepository.findByComplaintIdAndStudentId(complaint.getId(), user.getId()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> upvoteService.removeUpvote(complaint.getId(), user))
                .isInstanceOf(ConflictException.class)
                .hasMessage("You have not upvoted this issue.");
        verify(upvoteRepository, never()).delete(any(Upvote.class));
    }
}