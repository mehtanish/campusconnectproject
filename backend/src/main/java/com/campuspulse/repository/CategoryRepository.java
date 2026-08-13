package com.campuspulse.repository;

import com.campuspulse.model.Category;
import com.campuspulse.model.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    /** Get root-level categories (no parent) */
    List<Category> findByParentIsNull();

    /** Get child categories of a given parent */
    List<Category> findByParentId(UUID parentId);

    /** Get categories managed by a specific admin role */
    List<Category> findByAdminRole(Role adminRole);
}
