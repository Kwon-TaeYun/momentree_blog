package com.likelion.momentreeblog.domain.board.category.service;

import com.likelion.momentreeblog.domain.blog.blog.entity.Blog;
import com.likelion.momentreeblog.domain.blog.blog.repository.BlogRepository;
import com.likelion.momentreeblog.domain.board.category.dto.CategoryCreateRequestDto;
import com.likelion.momentreeblog.domain.board.category.dto.CategoryResponseDto;
import com.likelion.momentreeblog.domain.board.category.dto.CategoryUpdateRequestDto;
import com.likelion.momentreeblog.domain.board.category.entity.Category;
import com.likelion.momentreeblog.domain.board.category.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final BlogRepository blogRepository;

    @Transactional
    public CategoryResponseDto createCategory(CategoryCreateRequestDto requestDto) {
        Blog blog = blogRepository.findById(requestDto.getBlogId())
                .orElseThrow(() -> new IllegalArgumentException("블로그를 찾을 수 없습니다."));

        Category category = Category.builder()
                .name(requestDto.getName())
                .blog(blog)
                .build();

        Category saved = categoryRepository.save(category);

        return CategoryResponseDto.builder()
                .id(saved.getId())
                .name(saved.getName())
                .build();
    }

    @Transactional(readOnly = true)
    public CategoryResponseDto getCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 카테고리가 없습니다. id=" + id));
        return CategoryResponseDto.from(category);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponseDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(CategoryResponseDto::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponseDto updateCategory(Long id, CategoryUpdateRequestDto requestDto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 카테고리가 없습니다. id=" + id));

        category.update(requestDto.getName()); // 아래에서 update 메서드 설명할게
        return CategoryResponseDto.from(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }
}
