package com.campuspulse.controller;

import com.campuspulse.dto.complaint.ComplaintActivityResponse;
import com.campuspulse.dto.complaint.ComplaintTrackResponse;
import com.campuspulse.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/complaints")
@RequiredArgsConstructor
public class PublicComplaintController {

    private final ComplaintService complaintService;

    /**
     * Live activity stream: returns the most recently created/updated complaints
     * ordered by activity (updatedAt DESC), up to 15 items.
     */
    @GetMapping("/activity")
    public ResponseEntity<List<ComplaintActivityResponse>> getLiveActivity() {
        return ResponseEntity.ok(complaintService.getLiveActivity());
    }

    /**
     * Real-time complaint tracking: look up complaint by 8-character reference code (e.g. CMP-1048)
     * or complaint ID.
     */
    @GetMapping("/track/{code}")
    public ResponseEntity<ComplaintTrackResponse> trackComplaint(@PathVariable String code) {
        return ResponseEntity.ok(complaintService.trackComplaint(code));
    }
}
