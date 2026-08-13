package com.campuspulse.dto.complaint;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DuplicateCheckRequest {
    private String locationPath;
    private String issueTag;
}
