package com.campuspulse.dto.complaint;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DuplicateCheckResponse {
    @JsonProperty("isDuplicate")
    private boolean isDuplicate;
    private ComplaintResponse existingComplaint;
}
