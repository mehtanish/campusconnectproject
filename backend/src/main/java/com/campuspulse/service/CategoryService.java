package com.campuspulse.service;

import com.campuspulse.dto.category.CategoryResponse;
import com.campuspulse.model.Category;
import com.campuspulse.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getRootCategories() {
        return categoryRepository.findByParentIsNull().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getChildren(UUID parentId) {
        return categoryRepository.findByParentId(parentId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getFullTree() {
        List<Category> roots = categoryRepository.findByParentIsNull();
        return roots.stream()
                .map(this::toResponseWithChildren)
                .collect(Collectors.toList());
    }

    private CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .adminRole(category.getAdminRole().name())
                .hasChildren(!category.getChildren().isEmpty())
                .build();
    }

    private CategoryResponse toResponseWithChildren(Category category) {
        List<CategoryResponse> children = category.getChildren().stream()
                .map(this::toResponseWithChildren)
                .collect(Collectors.toList());

        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .adminRole(category.getAdminRole().name())
                .hasChildren(!children.isEmpty())
                .children(children)
                .build();
    }
}
