package com.campuspulse.repository;

import com.campuspulse.model.IssueType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IssueTypeRepository extends JpaRepository<IssueType, UUID> {

    /** All issue types in a given domain group */
    List<IssueType> findByGroupKeyOrderByDisplayLabelAsc(String groupKey);

    /** Validate that a stableKey exists (used in complaint creation) */
    boolean existsByStableKey(String stableKey);

    /** Lookup by stableKey for validation error messages */
    Optional<IssueType> findByStableKey(String stableKey);
}
