package com.campuspulse.service;

import com.campuspulse.dto.lostfound.LostFoundRequest;
import com.campuspulse.dto.lostfound.LostFoundResponse;
import com.campuspulse.model.LostFoundItem;
import com.campuspulse.model.User;
import com.campuspulse.model.enums.ItemStatus;
import com.campuspulse.model.enums.Role;
import com.campuspulse.repository.LostFoundItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LostFoundService {

    private final LostFoundItemRepository itemRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Transactional
    public LostFoundResponse reportFoundItem(LostFoundRequest request, MultipartFile image, User finder) {
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = saveImage(image);
        }

        LostFoundItem item = LostFoundItem.builder()
                .title(request.getTitle())
                .category(request.getCategory())
                .foundLocation(request.getFoundLocation())
                .foundDate(request.getFoundDate())
                .imageUrl(imageUrl)
                .hiddenDetails(request.getHiddenDetails())
                .status(ItemStatus.LISTED)
                .finder(finder)
                .build();

        item = itemRepository.save(item);
        return toResponse(item, finder.getRole() == Role.SUPER_ADMIN);
    }

    public List<LostFoundResponse> getAllItems(User currentUser) {
        boolean isAdmin = currentUser != null &&
                (currentUser.getRole() == Role.SUPER_ADMIN ||
                 currentUser.getRole().name().startsWith("ADMIN_"));

        return itemRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(item -> toResponse(item, isAdmin))
                .collect(Collectors.toList());
    }

    public List<LostFoundResponse> getItemsByStatus(ItemStatus status, User currentUser) {
        boolean isAdmin = currentUser != null &&
                currentUser.getRole() == Role.SUPER_ADMIN;

        return itemRepository.findByStatusOrderByCreatedAtDesc(status).stream()
                .map(item -> toResponse(item, isAdmin))
                .collect(Collectors.toList());
    }

    public LostFoundResponse getItemById(UUID id, User currentUser) {
        LostFoundItem item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        boolean isAdmin = currentUser != null &&
                currentUser.getRole() == Role.SUPER_ADMIN;

        return toResponse(item, isAdmin);
    }

    @Transactional
    public LostFoundResponse verifyClaimCode(String claimCode) {
        LostFoundItem item = itemRepository.findByClaimCode(claimCode)
                .orElseThrow(() -> new RuntimeException("Invalid claim code"));

        item.setStatus(ItemStatus.RETURNED);
        item = itemRepository.save(item);
        return toResponse(item, true);
    }

    private String saveImage(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path targetPath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save image: " + e.getMessage());
        }
    }

    private LostFoundResponse toResponse(LostFoundItem item, boolean includeHiddenDetails) {
        return LostFoundResponse.builder()
                .id(item.getId())
                .title(item.getTitle())
                .category(item.getCategory())
                .foundLocation(item.getFoundLocation())
                .foundDate(item.getFoundDate())
                .imageUrl(item.getImageUrl())
                .status(item.getStatus())
                .finderName(item.getFinder().getName())
                .finderId(item.getFinder().getId())
                .claimCode(item.getClaimCode())
                .hiddenDetails(includeHiddenDetails ? item.getHiddenDetails() : null)
                .createdAt(item.getCreatedAt())
                .build();
    }
}
