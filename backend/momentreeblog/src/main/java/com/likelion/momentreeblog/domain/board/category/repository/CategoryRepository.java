package com.likelion.momentreeblog.domain.board.category.repository;

import com.likelion.momentreeblog.domain.board.category.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
