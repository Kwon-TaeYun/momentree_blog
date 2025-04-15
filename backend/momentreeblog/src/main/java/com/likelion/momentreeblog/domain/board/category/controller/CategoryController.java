package com.likelion.momentreeblog.domain.board.category.controller;

import com.likelion.momentreeblog.domain.board.category.dto.CategoryCreateRequestDto;
import com.likelion.momentreeblog.domain.board.category.dto.CategoryUpdateRequestDto;
import com.likelion.momentreeblog.domain.board.category.dto.CategoryResponseDto;
import com.likelion.momentreeblog.domain.board.category.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    // 카테고리 생성
    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody CategoryCreateRequestDto requestDto) {
        try {
            return ResponseEntity.ok(categoryService.createCategory(requestDto));
        }catch (IllegalArgumentException e){
            return ResponseEntity.ok(e.getMessage())
;        }
    }

    // 카테고리 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<?> getCategory(@PathVariable(name = "id") Long id) {
        try {
            return ResponseEntity.ok(categoryService.getCategory(id));
        }catch (IllegalArgumentException e){
            return ResponseEntity.ok(e.getMessage());
        }
    }

    // 모든 카테고리 조회 (선택)
    @GetMapping
    public ResponseEntity<?> getAllCategories() {
            return ResponseEntity.ok(categoryService.getAllCategories());
    }

    // 카테고리 수정
    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponseDto> updateCategory(
            @PathVariable(name = "id") Long id,
            @RequestBody CategoryUpdateRequestDto requestDto) {
        return ResponseEntity.ok(categoryService.updateCategory(id, requestDto));
    }

    // 카테고리 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable(name = "id") Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
