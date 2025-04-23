package com.likelion.momentreeblog.domain.board.category.service;

import com.likelion.momentreeblog.domain.blog.blog.entity.Blog;
import com.likelion.momentreeblog.domain.blog.blog.repository.BlogRepository;
import com.likelion.momentreeblog.domain.board.board.repository.BoardRepository;
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
    private final BoardRepository boardRepository;

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


//    @Transactional
//    public void deleteCategory(Long userId, Long categoryId) {
//        User user = userService.findUserById(userId);
//        Long userBlogId = user.getBlog().getId();
//
//        Category category = categoryRepository.findById(categoryId)
//                .orElseThrow(() -> new IllegalArgumentException("해당 카테고리가 없습니다. id=" + categoryId));
//
//        if (!category.getBlog().getId().equals(userBlogId)) {
//            throw new IllegalArgumentException("해당 카테고리에 대한 삭제 권한이 없습니다.");
//        }
//
//        categoryRepository.delete(category);
//    }

    public void deleteCategoryByName(Long userId, Long blogId, String categoryName) {
        // 블로그 존재 여부 확인
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new IllegalArgumentException("해당 블로그가 존재하지 않습니다."));

        // 블로그 소유자 확인
        if (!blog.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("해당 블로그의 소유자가 아닙니다.");
        }

        // 카테고리 찾기
        Category category = categoryRepository.findByBlogIdAndName(blogId, categoryName)
                .orElseThrow(() -> new IllegalArgumentException("해당 카테고리를 찾을 수 없습니다."));

        boolean hasBoards = boardRepository.existsByCategory(category);
        if (hasBoards) {
            throw new IllegalStateException("해당 카테고리를 사용하는 게시글이 존재합니다. " +
                    "해당 카테고리를 가진 게시글을 먼저 삭제해주시면 카테고리 삭제가 가능합니다.");
        }
        categoryRepository.delete(category);
    }
}
