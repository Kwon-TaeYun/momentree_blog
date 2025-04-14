package com.likelion.momentreeblog.domain.board.category.repository;

import com.likelion.momentreeblog.domain.blog.category.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

}