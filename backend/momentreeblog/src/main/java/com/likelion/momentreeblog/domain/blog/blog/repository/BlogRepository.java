package com.likelion.momentreeblog.domain.blog.blog.repository;

import com.likelion.momentreeblog.domain.blog.blog.entity.Blog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlogRepository extends JpaRepository<Blog, Long> {

}
