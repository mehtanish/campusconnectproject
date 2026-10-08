package com.campuspulse.dto.lostfound;

import com.campuspulse.model.enums.ItemStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LostFoundResponse {
    private UUID id;
    private String title;
    private String category;
    private String foundLocation;
    private LocalDate foundDate;
    private String imageUrl;
    private ItemStatus status;
    private String finderName;
    private UUID finderId;
    private LocalDateTime createdAt;

    /** Only populated for admins */
    private String hiddenDetails;
}
