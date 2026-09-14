package com.campuspulse.controller;

import com.campuspulse.dto.issuetype.IssueTypeResponse;
import com.campuspulse.service.IssueTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/issue-types")
@RequiredArgsConstructor
public class IssueTypeController {

    private final IssueTypeService issueTypeService;

    /**
     * Returns all controlled-vocabulary issue types as a flat list.
     * No authentication required — used by the complaint form on page load.
     */
    @GetMapping
    public ResponseEntity<List<IssueTypeResponse>> getAll() {
        return ResponseEntity.ok(issueTypeService.getAll());
    }

    /**
     * Returns all issue types grouped by their domain group key.
     * Useful if the frontend wants to filter by category branch.
     */
    @GetMapping("/grouped")
    public ResponseEntity<Map<String, List<IssueTypeResponse>>> getAllGrouped() {
        return ResponseEntity.ok(issueTypeService.getAllGrouped());
    }

    /**
     * Returns issue types for a specific domain group (e.g. "wifi", "mess").
     */
    @GetMapping("/{groupKey}")
    public ResponseEntity<List<IssueTypeResponse>> getByGroup(@PathVariable String groupKey) {
        return ResponseEntity.ok(issueTypeService.getByGroup(groupKey));
    }
}
