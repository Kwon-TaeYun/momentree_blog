package com.likelion.momentreeblog.domain.blog.blog.controller;

import com.likelion.momentreeblog.config.security.dto.CustomUserDetails;
import com.likelion.momentreeblog.domain.blog.blog.dto.BlogDetailResponseDto;
import com.likelion.momentreeblog.domain.blog.blog.dto.BlogResponseDto;
import com.likelion.momentreeblog.domain.blog.blog.dto.BlogUpdateRequestDto;
import com.likelion.momentreeblog.domain.blog.blog.entity.Blog;
import com.likelion.momentreeblog.domain.blog.blog.service.BlogService;
import com.likelion.momentreeblog.domain.board.board.dto.BoardListResponseDto;
import com.likelion.momentreeblog.global.util.jwt.JwtTokenizer;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/blogs") // API 경로 통일
@RequiredArgsConstructor
@Slf4j
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

    /**
     * 블로그 상세 조회 (게시물 목록 포함)
     */
    /**
     * 블로그 상세 조회 (게시물 목록 포함)
     */
    @GetMapping("/{id}/details")
    public ResponseEntity<?> getBlogDetails(
            @PathVariable(name = "id") Long id, //블로그 ID
            @RequestParam(defaultValue = "0", name = "page") int page,
            @RequestParam(defaultValue = "10", name = "size") int size,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {

        Long loggedInUserId = null;
        if (customUserDetails != null) {
            loggedInUserId = customUserDetails.getUserId(); // CustomUserDetails에서 유저 ID 가져옴
            log.info("✅ Blog Details Requested by Authenticated User ID: {}", loggedInUserId); // 인증된 유저 로그
        } else {
            log.info("✅ Blog Details Requested by Anonymous User (No Principal)"); // 인증되지 않은 유저 로그
        }

        try {
            // blogService 메소드에 로그인된 유저 ID 전달
            BlogDetailResponseDto details = blogService.getBlogDetails(id, page, size, loggedInUserId); // <-- 블로그 ID(id)와 로그인 유저 ID 전달

            return ResponseEntity.ok(details);
        } catch (IllegalArgumentException e) {
            log.warn("⚠️ Blog not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Error fetching blog details:", e); // 예외 스택 트레이스 로깅
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "블로그 조회 중 오류가 발생했습니다."));
        }
    }


}

