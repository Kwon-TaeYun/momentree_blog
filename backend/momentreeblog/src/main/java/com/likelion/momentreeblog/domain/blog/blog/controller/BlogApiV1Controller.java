package com.likelion.momentreeblog.domain.blog.blog.controller;

import com.likelion.momentreeblog.domain.blog.blog.dto.BlogResponseDto;
import com.likelion.momentreeblog.domain.blog.blog.dto.BlogUpdateRequestDto;
import com.likelion.momentreeblog.domain.blog.blog.entity.Blog;
import com.likelion.momentreeblog.domain.blog.blog.service.BlogService;
import com.likelion.momentreeblog.global.util.jwt.JwtTokenizer;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/blogs") // API 경로 통일
@RequiredArgsConstructor
public class BlogApiV1Controller {

    private final BlogService blogService;
    private final JwtTokenizer jwtTokenizer;

    /**
     * 블로그 생성 -> 유저 생성시 자동 생성되므로 필요없다!!!
     */
//    @PostMapping
//    public ResponseEntity<BlogResponseDto> createBlog(@RequestBody BlogCreateRequestDto requestDto) {
//        return ResponseEntity.ok(blogService.createBlog(requestDto));
//    }

    /**
     * 블로그 단건 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getBlog(@PathVariable(name = "id") Long id) {
        Optional<Blog> optionalBlog = blogService.findById(id);

        if (optionalBlog.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "블로그를 찾을 수 없습니다.");
            return ResponseEntity.ok(response);
        }

        Blog blog = optionalBlog.get();
        BlogResponseDto dto = BlogResponseDto.builder()
                .id(blog.getId())
                .name(blog.getName())
                .viewCount(blog.getViewCount())
                .build();

        return ResponseEntity.ok(dto);
    }

    /**
     * 블로그 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBlog(
            @PathVariable(name = "id") Long id,
            @RequestBody BlogUpdateRequestDto requestDto, @RequestHeader(value = "Authorization") String authorization) {
        Long userId = jwtTokenizer.getUserIdFromToken(authorization);

        Optional<Blog> optionalBlog = blogService.findById(id);

        if (optionalBlog.isEmpty()) {
            Map<String, Object> body = new HashMap<>();
            body.put("message", "블로그를 찾을 수 없습니다.");
            return ResponseEntity.ok(body); // 200 OK + 메시지
        }

        Blog blog = optionalBlog.get();

        // 블로그 주인 검증
        if (!blog.getUser().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "이 블로그를 수정할 권한이 없습니다."));
        }

        BlogResponseDto response = blogService.updateBlog(id, requestDto);
        return ResponseEntity.ok(response);
    }

    /**
     * 블로그 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBlog(@PathVariable(name = "id") Long id, @RequestHeader(value = "Authorization") String authorization) {
        Long userId = jwtTokenizer.getUserIdFromToken(authorization);

        // 블로그 조회
        Optional<Blog> optionalBlog = blogService.findById(id);

        if (optionalBlog.isEmpty()) {
            Map<String, Object> body = new HashMap<>();
            body.put("message", "블로그를 찾을 수 없습니다.");
            return ResponseEntity.ok(body); // 200 OK + 메시지
        }

        Blog blog = optionalBlog.get();

        // 블로그 주인 검증
        if (!blog.getUser().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "이 블로그를 수정할 권한이 없습니다."));
        }

        blogService.deleteBlog(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}
