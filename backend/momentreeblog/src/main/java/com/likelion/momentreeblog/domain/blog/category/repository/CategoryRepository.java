package com.likelion.momentreeblog.domain.blog.category.repository;

import com.likelion.momentreeblog.domain.blog.category.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
