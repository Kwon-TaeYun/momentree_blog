package com.likelion.momentreeblog.domain.board.category.service;

import com.likelion.momentreeblog.domain.blog.blog.entity.Blog;
import com.likelion.momentreeblog.domain.blog.blog.repository.BlogRepository;
import com.likelion.momentreeblog.domain.board.category.dto.CategoryCreateRequestDto;
import com.likelion.momentreeblog.domain.board.category.dto.CategoryResponseDto;
import com.likelion.momentreeblog.domain.board.category.dto.CategoryUpdateRequestDto;
import com.likelion.momentreeblog.domain.board.category.entity.Category;
import com.likelion.momentreeblog.domain.board.category.repository.CategoryRepository;
import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.domain.user.user.service.UserService;
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
    private final UserService userService;

    @Transactional
    public CategoryResponseDto createCategory(Long blogId, CategoryCreateRequestDto requestDto) {
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new IllegalArgumentException("블로그를 찾을 수 없습니다."));

        boolean isDuplicate = categoryRepository.existsByBlogAndName(blog, requestDto.getName());
        if (isDuplicate) {
            throw new IllegalArgumentException("이미 존재하는 카테고리 이름입니다.");
        }

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
    public List<CategoryResponseDto> getAllCategoriesByUserId(Long userId) {
        User user = userService.findUserById(userId);
        Blog blog = user.getBlog();

        List<Category> categories = categoryRepository.findAllByBlog(blog);

        return categories.stream()
                .map(CategoryResponseDto::from)
                .collect(Collectors.toList());
    }


    @Transactional
    public CategoryResponseDto updateCategory(Long userId, Long categoryId, CategoryUpdateRequestDto requestDto) {
        User user = userService.findUserById(userId);
        Long userBlogId = user.getBlog().getId();

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("해당 카테고리가 없습니다. id=" + categoryId));

        if (!category.getBlog().getId().equals(userBlogId)) {
            throw new IllegalArgumentException("해당 카테고리에 대한 수정 권한이 없습니다.");
        }

        category.update(requestDto.getName());
        return CategoryResponseDto.from(category);
    }


    @Transactional
    public void deleteCategory(Long userId, Long categoryId) {
        User user = userService.findUserById(userId);
        Long userBlogId = user.getBlog().getId();

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("해당 카테고리가 없습니다. id=" + categoryId));

        if (!category.getBlog().getId().equals(userBlogId)) {
            throw new IllegalArgumentException("해당 카테고리에 대한 삭제 권한이 없습니다.");
        }

        categoryRepository.delete(category);
    }
}
