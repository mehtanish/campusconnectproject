package com.campuspulse.dto.issuetype;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueTypeResponse {
    /** Stable key stored in Complaint.issueTag — never changes after seeding */
    private String stableKey;
    /** Human-readable label for the UI dropdown */
    private String displayLabel;
    /** Domain group (e.g. "wifi", "washroom", "mess") */
    private String groupKey;
}
