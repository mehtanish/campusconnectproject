package com.campuspulse.service;

import com.campuspulse.dto.issuetype.IssueTypeResponse;
import com.campuspulse.model.IssueType;
import com.campuspulse.repository.IssueTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class IssueTypeService {

    private final IssueTypeRepository issueTypeRepository;

    /** Returns all issue types as a flat list, ordered by groupKey then displayLabel */
    @Transactional(readOnly = true)
    public List<IssueTypeResponse> getAll() {
        return issueTypeRepository.findAll().stream()
                .sorted(java.util.Comparator
                        .comparing(IssueType::getGroupKey)
                        .thenComparing(IssueType::getDisplayLabel))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** Returns all issue types grouped by groupKey (preserves insertion order) */
    @Transactional(readOnly = true)
    public Map<String, List<IssueTypeResponse>> getAllGrouped() {
        return getAll().stream()
                .collect(Collectors.groupingBy(
                        IssueTypeResponse::getGroupKey,
                        LinkedHashMap::new,
                        Collectors.toList()));
    }

    /** Returns issue types for a single group */
    @Transactional(readOnly = true)
    public List<IssueTypeResponse> getByGroup(String groupKey) {
        return issueTypeRepository.findByGroupKeyOrderByDisplayLabelAsc(groupKey)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Validates that the stableKey is a known controlled-vocabulary value.
     * Throws IllegalArgumentException if not — this becomes a 400 in the complaint controller.
     */
    public void validateStableKey(String stableKey) {
        if (stableKey == null || stableKey.isBlank()) {
            throw new IllegalArgumentException("issueTag is required");
        }
        if (!issueTypeRepository.existsByStableKey(stableKey)) {
            throw new IllegalArgumentException(
                    "Unknown issueTag: '" + stableKey + "'. Must be a value from GET /api/issue-types");
        }
    }

    private IssueTypeResponse toResponse(IssueType it) {
        return IssueTypeResponse.builder()
                .stableKey(it.getStableKey())
                .displayLabel(it.getDisplayLabel())
                .groupKey(it.getGroupKey())
                .build();
    }
}
