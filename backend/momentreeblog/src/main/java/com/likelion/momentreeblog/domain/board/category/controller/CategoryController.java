package com.likelion.momentreeblog.domain.board.category.controller;

import com.likelion.momentreeblog.domain.board.category.dto.CategoryCreateRequestDto;
import com.likelion.momentreeblog.domain.board.category.dto.CategoryUpdateRequestDto;
import com.likelion.momentreeblog.domain.board.category.dto.CategoryResponseDto;
import com.likelion.momentreeblog.domain.board.category.service.CategoryService;
import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.domain.user.user.service.UserService;
import com.likelion.momentreeblog.global.util.jwt.JwtTokenizer;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final JwtTokenizer jwtTokenizer;
    private final UserService userService;
    //여기서 id는 블로그 id

    // 카테고리 생성
    @PostMapping("/{id}")
    public ResponseEntity<?> createCategory(@RequestBody CategoryCreateRequestDto requestDto,
                                            @PathVariable(name = "id") Long id,
                                            @RequestHeader("Authorization") String authorizationHeader) {
        Long userId = jwtTokenizer.getUserIdFromToken(authorizationHeader);
        User user = userService.findUserById(userId);
        Long userBlogId = user.getBlog().getId();

        try {
            if (userBlogId.equals(id)) {
                CategoryResponseDto response = categoryService.createCategory(id, requestDto);
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(401).body("권한이 없습니다.");
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }


    // 카테고리 단건 조회
    @GetMapping("/{id}/{categoryId}")
    public ResponseEntity<?> getCategory(@PathVariable(name = "id") Long id, @PathVariable(name = "categoryId") Long categoryId) {
        try {
            return ResponseEntity.ok(categoryService.getCategory(categoryId));
        }catch (IllegalArgumentException e){
            return ResponseEntity.ok(e.getMessage());
        }
    }

    // 모든 카테고리 조회 (선택)
    @GetMapping
    public ResponseEntity<?> getAllCategories(@RequestHeader("Authorization") String authHeader) {
        Long userId = jwtTokenizer.getUserIdFromToken(authHeader);
        User user = userService.findUserById(userId);
        Long userBlogId = user.getBlog().getId();


        List<CategoryResponseDto> categories = categoryService.getAllCategoriesByUserId(userId);
        return ResponseEntity.ok(categories);
    }


    // 카테고리 수정
    @PutMapping("/{categoryId}")
    public ResponseEntity<?> updateCategory(@PathVariable(name = "categoryId") Long categoryId,
                                            @RequestBody CategoryUpdateRequestDto requestDto,
                                            @RequestHeader("Authorization") String authHeader) {
        Long userId = jwtTokenizer.getUserIdFromToken(authHeader);
        try {
            CategoryResponseDto response = categoryService.updateCategory(userId, categoryId, requestDto);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    //카테고리 삭제
    @DeleteMapping("/{categoryId}")
    public ResponseEntity<?> deleteCategory(@PathVariable(name = "categoryId") Long categoryId,
                                            @RequestHeader("Authorization") String authHeader) {
        Long userId = jwtTokenizer.getUserIdFromToken(authHeader);
        try {
            categoryService.deleteCategory(userId, categoryId);
            return ResponseEntity.ok("카테고리 삭제 성공");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }
}
