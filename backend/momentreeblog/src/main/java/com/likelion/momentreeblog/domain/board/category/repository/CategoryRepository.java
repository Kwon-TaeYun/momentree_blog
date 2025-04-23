package com.likelion.momentreeblog.domain.board.category.repository;

import com.likelion.momentreeblog.domain.blog.blog.entity.Blog;
import com.likelion.momentreeblog.domain.board.category.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Blog> findByName(String name);
    boolean existsByBlogAndName(Blog blog, String name);
    List<Category> findAllByBlog(Blog blog);
    Optional<Category> findByBlogIdAndName(Long blogId, String name);
    Optional<Category> findByBlogAndIsDefaultTrue(Blog blog);
}
