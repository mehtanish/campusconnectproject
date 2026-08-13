package com.campuspulse.controller;

import com.campuspulse.dto.lostfound.*;
import com.campuspulse.model.User;
import com.campuspulse.model.enums.ItemStatus;
import com.campuspulse.service.ClaimService;
import com.campuspulse.service.LostFoundService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/lost-found")
@RequiredArgsConstructor
public class LostFoundController {

    private final LostFoundService lostFoundService;
    private final ClaimService claimService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<LostFoundResponse> reportFoundItem(
            @RequestPart("data") LostFoundRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(lostFoundService.reportFoundItem(request, image, user));
    }

    @GetMapping
    public ResponseEntity<List<LostFoundResponse>> getAllItems(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(lostFoundService.getAllItems(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LostFoundResponse> getItemById(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(lostFoundService.getItemById(id, user));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<LostFoundResponse>> getItemsByStatus(
            @PathVariable ItemStatus status,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(lostFoundService.getItemsByStatus(status, user));
    }

    @PostMapping("/claim")
    public ResponseEntity<ClaimResponse> submitClaim(
            @Valid @RequestBody ClaimRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(claimService.submitClaim(request, user));
    }

    @GetMapping("/my-claims")
    public ResponseEntity<List<ClaimResponse>> getMyClaims(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(claimService.getMyClaims(user));
    }

    @PostMapping("/verify/{claimCode}")
    public ResponseEntity<LostFoundResponse> verifyClaimCode(@PathVariable String claimCode) {
        return ResponseEntity.ok(lostFoundService.verifyClaimCode(claimCode));
    }
}
