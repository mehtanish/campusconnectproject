package com.campuspulse.dto.complaint;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DuplicateCheckResponse {
    private boolean isDuplicate;
    private ComplaintResponse existingComplaint;
}
