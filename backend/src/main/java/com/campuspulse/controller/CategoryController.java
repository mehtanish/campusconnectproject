package com.campuspulse.controller;

import com.campuspulse.dto.category.CategoryResponse;
import com.campuspulse.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getRootCategories() {
        return ResponseEntity.ok(categoryService.getRootCategories());
    }

    @GetMapping("/{parentId}/children")
    public ResponseEntity<List<CategoryResponse>> getChildren(@PathVariable UUID parentId) {
        return ResponseEntity.ok(categoryService.getChildren(parentId));
    }

    @GetMapping("/tree")
    public ResponseEntity<List<CategoryResponse>> getFullTree() {
        return ResponseEntity.ok(categoryService.getFullTree());
    }
}
