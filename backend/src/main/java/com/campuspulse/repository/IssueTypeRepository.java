package com.campuspulse.repository;

import com.campuspulse.model.IssueType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM IssueType i WHERE i.stableKey = :stableKey")
    Optional<IssueType> findByStableKeyForUpdate(@Param("stableKey") String stableKey);
}
