package com.likelion.momentreeblog.domain.blog.blog.controller;

import com.likelion.momentreeblog.domain.blog.blog.dto.BlogCreateRequestDto;
import com.likelion.momentreeblog.domain.blog.blog.dto.BlogResponseDto;
import com.likelion.momentreeblog.domain.blog.blog.dto.BlogUpdateRequestDto;
import com.likelion.momentreeblog.domain.blog.blog.entity.Blog;
import com.likelion.momentreeblog.domain.blog.blog.service.BlogService;
import com.likelion.momentreeblog.global.util.jwt.JwtTokenizer;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/blogs") // API 경로 통일
@RequiredArgsConstructor
public class BlogController {

    private final BlogService blogService;
    private final JwtTokenizer jwtTokenizer;

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
    public ResponseEntity<BlogResponseDto> getBlog(@PathVariable(name = "id") Long id) {
        return ResponseEntity.ok(blogService.getBlog(id));
    }

    /**
     * 블로그 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<BlogResponseDto> updateBlog(
            @PathVariable(name = "id") Long id,
            @RequestBody BlogUpdateRequestDto requestDto, @RequestHeader(value = "Authorization") String authorization) {
        Long userId = jwtTokenizer.getUserIdFromToken(authorization);

        // 블로그 조회
        Blog blog = blogService.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 블로그를 찾을 수 없습니다."));

        // 블로그 주인 검증
        if (!blog.getUser().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // 403 권한 없음
        }
        return ResponseEntity.ok(blogService.updateBlog(id, requestDto));
    }

    /**
     * 블로그 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBlog(@PathVariable(name = "id") Long id, @RequestHeader(value = "Authorization") String authorization) {
        Long userId = jwtTokenizer.getUserIdFromToken(authorization);

        // 블로그 조회
        Blog blog = blogService.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 블로그를 찾을 수 없습니다."));

        // 블로그 주인 검증
        if (!blog.getUser().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // 403 권한 없음
        }

        blogService.deleteBlog(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}
