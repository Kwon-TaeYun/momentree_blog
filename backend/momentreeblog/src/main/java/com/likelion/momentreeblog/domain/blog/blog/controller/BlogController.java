package com.likelion.momentreeblog.domain.blog.blog.controller;

import com.likelion.momentreeblog.domain.blog.blog.dto.BlogCreateRequestDto;
import com.likelion.momentreeblog.domain.blog.blog.dto.BlogResponseDto;
import com.likelion.momentreeblog.domain.blog.blog.dto.BlogUpdateRequestDto;
import com.likelion.momentreeblog.domain.blog.blog.service.BlogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/blogs") // API 경로 통일
@RequiredArgsConstructor
public class BlogController {

    private final BlogService blogService;

    /**
     * 블로그 생성
     */
    @PostMapping
    public ResponseEntity<BlogResponseDto> createBlog(@RequestBody BlogCreateRequestDto requestDto) {
        return ResponseEntity.ok(blogService.createBlog(requestDto));
    }

    /**
     * 블로그 단건 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<BlogResponseDto> getBlog(@PathVariable Long id) {
        return ResponseEntity.ok(blogService.getBlog(id));
    }

    /**
     * 블로그 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<BlogResponseDto> updateBlog(
            @PathVariable Long id,
            @RequestBody BlogUpdateRequestDto requestDto) {
        return ResponseEntity.ok(blogService.updateBlog(id, requestDto));
    }

    /**
     * 블로그 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBlog(@PathVariable Long id) {
        blogService.deleteBlog(id);
        return ResponseEntity.noContent().build();
    }
}
