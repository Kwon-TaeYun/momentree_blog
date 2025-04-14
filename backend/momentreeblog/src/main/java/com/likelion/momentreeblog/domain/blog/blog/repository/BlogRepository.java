package com.likelion.momentreeblog.domain.blog.blog.repository;

import com.likelion.momentreeblog.domain.blog.blog.entity.Blog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BlogRepository extends JpaRepository<Blog, Long> {
    Optional<Blog> findByName(String name);
    Optional<Blog> findByUserId(Long userId);

}
