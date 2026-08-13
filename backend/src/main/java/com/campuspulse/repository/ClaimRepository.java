package com.campuspulse.repository;

import com.campuspulse.model.Claim;
import com.campuspulse.model.enums.ClaimStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, UUID> {

    List<Claim> findByItemId(UUID itemId);

    List<Claim> findByClaimantIdOrderByCreatedAtDesc(UUID claimantId);

    List<Claim> findByStatusOrderByCreatedAtDesc(ClaimStatus status);

    boolean existsByItemIdAndClaimantId(UUID itemId, UUID claimantId);
}
