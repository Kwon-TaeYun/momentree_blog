package com.likelion.momentreeblog.domain.blog.blog.service;

import com.likelion.momentreeblog.domain.blog.blog.dto.BlogDetailResponseDto;
import com.likelion.momentreeblog.domain.blog.blog.dto.BlogResponseDto;
import com.likelion.momentreeblog.domain.blog.blog.dto.BlogUpdateRequestDto;
import com.likelion.momentreeblog.domain.blog.blog.entity.Blog;
import com.likelion.momentreeblog.domain.blog.blog.repository.BlogRepository;
import com.likelion.momentreeblog.domain.board.board.dto.BoardListResponseDto;
import com.likelion.momentreeblog.domain.board.board.service.BoardService;
import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.domain.user.user.repository.UserRepository;
import com.likelion.momentreeblog.domain.user.user.userenum.UserStatus;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BlogService {

    private final BlogRepository blogRepository;
    private final UserRepository userRepository;
    private final BoardService boardService;

    /**
     * 블로그 생성
     */
//    public BlogResponseDto createBlog(BlogCreateRequestDto requestDto) {
//        User user = userRepository.findById(requestDto.getUserId())
//                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
//
//        Blog blog = Blog.builder()
//                .name(requestDto.getName())
//                .user(user)
//                .viewCount(0L)
//                .build();
//
//        Blog saved = blogRepository.save(blog);
//
//        return BlogResponseDto.builder()
//                .id(saved.getId())
//                .name(saved.getName())
//                .viewCount(saved.getViewCount())
//                .build();
//    }

    /**
     * 블로그 단건 조회
     */
    public BlogResponseDto getBlog(Long id) {
        Optional<Blog> optionalBlog = blogRepository.findById(id);

        if (optionalBlog.isEmpty()) {
            return BlogResponseDto.builder()
                    .id(null)
                    .name("블로그를 찾을 수 없습니다.")
                    .viewCount(0L)
                    .build();
        }
        Blog blog = optionalBlog.get();

        User user = blog.getUser();

        BlogResponseDto blogResponseDto = BlogResponseDto.builder()
                .id(blog.getId())
                .name(blog.getName())
                .viewCount(blog.getViewCount())
                .build();

        if (user.getStatus() == UserStatus.DELETED) {
            blogResponseDto.setName("탈퇴한 회원입니다");
        }

        return blogResponseDto;
    }

    /**
     * 블로그 수정
     */
    public BlogResponseDto updateBlog(Long id, BlogUpdateRequestDto requestDto) {
        Optional<Blog> optionalBlog = blogRepository.findById(id);

        if (optionalBlog.isEmpty()) {
            return BlogResponseDto.builder()
                    .id(null)
                    .name("블로그를 찾을 수 없습니다.")
                    .viewCount(0L)
                    .build();
        }

        Blog blog = optionalBlog.get();
        blog.setName(requestDto.getName());

        Blog updated = blogRepository.save(blog);

        return BlogResponseDto.builder()
                .id(updated.getId())
                .name(updated.getName())
                .viewCount(updated.getViewCount())
                .build();
    }

    /**
     * 블로그 삭제
     */
    public void deleteBlog(Long id) {
        blogRepository.deleteById(id);
    }

    public Optional<Blog> findById(Long id) {
        return blogRepository.findById(id);
    }


    public Blog findByUserId(Long userId) {
        return blogRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("해당 유저의 블로그가 없습니다"));
    }



    /**
     * 블로그 상세보기
     */
    public BlogDetailResponseDto getBlogDetails(Long blogId, int page, int size) {
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new IllegalArgumentException("블로그를 찾을 수 없습니다."));

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<BoardListResponseDto> boards = boardService.getBoardsByBlogId(blogId, pageable);

        // 필요한 연관 엔티티들을 명시적으로 초기화
        Hibernate.initialize(blog.getUser());

        String profileImage = null;
        if (blog.getUser() != null && blog.getUser().getCurrentProfilePhoto() != null) {
            profileImage = blog.getUser().getCurrentProfilePhoto().getUrl();
        }

        return BlogDetailResponseDto.builder()
                .id(blog.getId())
                .name(blog.getName())
                .userName(blog.getUser() != null ? blog.getUser().getName() : "알 수 없음")
                .userEmail(blog.getUser() != null ? blog.getUser().getEmail() : "알 수 없음")
                .profileImage(profileImage)
                .boards(boards)
                .build();
    }
}
