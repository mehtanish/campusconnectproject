package com.campuspulse.dto.comment;

import com.campuspulse.model.enums.Role;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {

    private UUID id;
    private UUID complaintId;
    private UUID authorId;
    private String authorName;
    private Role authorRole;
    private String content;
    private LocalDateTime createdAt;
}
