package com.campuspulse.repository;

import com.campuspulse.model.LostFoundItem;
import com.campuspulse.model.enums.ItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LostFoundItemRepository extends JpaRepository<LostFoundItem, UUID> {

    List<LostFoundItem> findByStatusOrderByCreatedAtDesc(ItemStatus status);

    List<LostFoundItem> findAllByOrderByCreatedAtDesc();

    List<LostFoundItem> findByFinderIdOrderByCreatedAtDesc(UUID finderId);

    Optional<LostFoundItem> findByClaimCode(String claimCode);

    long countByStatus(ItemStatus status);
}
