package com.campuspulse.service;

import com.campuspulse.dto.lostfound.ClaimRequest;
import com.campuspulse.dto.lostfound.ClaimResponse;
import com.campuspulse.model.Claim;
import com.campuspulse.model.LostFoundItem;
import com.campuspulse.model.User;
import com.campuspulse.model.enums.ClaimStatus;
import com.campuspulse.model.enums.ItemStatus;
import com.campuspulse.repository.ClaimRepository;
import com.campuspulse.repository.LostFoundItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final LostFoundItemRepository itemRepository;

    private static final String ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    @Transactional
    public ClaimResponse submitClaim(ClaimRequest request, User claimant) {
        LostFoundItem item = itemRepository.findById(request.getItemId())
                .orElseThrow(() -> new RuntimeException("Item not found"));

        if (item.getStatus() == ItemStatus.RETURNED) {
            throw new RuntimeException("This item has already been returned");
        }

        if (claimRepository.existsByItemIdAndClaimantId(item.getId(), claimant.getId())) {
            throw new RuntimeException("You have already submitted a claim for this item");
        }

        Claim claim = Claim.builder()
                .item(item)
                .claimant(claimant)
                .proofDescription(request.getProofDescription())
                .status(ClaimStatus.PENDING)
                .build();

        // Update item status to CLAIM_PENDING
        item.setStatus(ItemStatus.CLAIM_PENDING);
        itemRepository.save(item);

        claim = claimRepository.save(claim);
        return toResponse(claim);
    }

    @Transactional
    public ClaimResponse approveClaim(UUID claimId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));

        claim.setStatus(ClaimStatus.APPROVED);

        // Generate 6-digit alphanumeric claim code
        String claimCode = generateClaimCode();
        LostFoundItem item = claim.getItem();
        item.setClaimCode(claimCode);
        itemRepository.save(item);

        claim = claimRepository.save(claim);

        ClaimResponse response = toResponse(claim);
        response.setClaimCode(claimCode);
        return response;
    }

    @Transactional
    public ClaimResponse rejectClaim(UUID claimId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));

        claim.setStatus(ClaimStatus.REJECTED);
        claim = claimRepository.save(claim);

        // Check if there are other pending claims, otherwise reset item status
        List<Claim> pendingClaims = claimRepository.findByItemId(claim.getItem().getId())
                .stream()
                .filter(c -> c.getStatus() == ClaimStatus.PENDING)
                .collect(Collectors.toList());

        if (pendingClaims.isEmpty()) {
            LostFoundItem item = claim.getItem();
            item.setStatus(ItemStatus.LISTED);
            itemRepository.save(item);
        }

        return toResponse(claim);
    }

    @Transactional(readOnly = true)
    public List<ClaimResponse> getPendingClaims() {
        return claimRepository.findByStatusOrderByCreatedAtDesc(ClaimStatus.PENDING)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClaimResponse> getClaimsByItem(UUID itemId) {
        return claimRepository.findByItemId(itemId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClaimResponse> getMyClaims(User claimant) {
        return claimRepository.findByClaimantIdOrderByCreatedAtDesc(claimant.getId())
                .stream()
                .map(c -> {
                    ClaimResponse response = toResponse(c);
                    // Include claim code for approved claims
                    if (c.getStatus() == ClaimStatus.APPROVED && c.getItem().getClaimCode() != null) {
                        response.setClaimCode(c.getItem().getClaimCode());
                    }
                    return response;
                })
                .collect(Collectors.toList());
    }

    private String generateClaimCode() {
        StringBuilder code = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            code.append(ALPHANUMERIC.charAt(RANDOM.nextInt(ALPHANUMERIC.length())));
        }
        return code.toString();
    }

    private ClaimResponse toResponse(Claim claim) {
        return ClaimResponse.builder()
                .id(claim.getId())
                .itemId(claim.getItem().getId())
                .itemTitle(claim.getItem().getTitle())
                .claimantId(claim.getClaimant().getId())
                .claimantName(claim.getClaimant().getName())
                .claimantRollNo(claim.getClaimant().getRollNo())
                .proofDescription(claim.getProofDescription())
                .status(claim.getStatus())
                .createdAt(claim.getCreatedAt())
                .build();
    }
}
