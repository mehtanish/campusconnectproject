package com.campuspulse.dto.lostfound;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LostFoundRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Found location is required")
    private String foundLocation;

    @NotNull(message = "Found date is required")
    private LocalDate foundDate;

    /** Hidden verification details (only visible to admin during claim review) */
    private String hiddenDetails;
}
