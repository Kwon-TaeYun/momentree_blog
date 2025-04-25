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
import org.springframework.transaction.annotation.Transactional;
import com.likelion.momentreeblog.domain.user.user.repository.FollowRepository;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // 조회 메소드에 ReadOnly 트랜잭션 적용
public class BlogService {

    private final BlogRepository blogRepository;
    private final UserRepository userRepository; // User 조회에 필요
    private final BoardService boardService; // 게시글 조회에 필요
    private final FollowRepository followRepository; // 팔로우 관련 정보 조회에 필요


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
    @Transactional(readOnly = true) // <-- Transactional 임포트 누락 해결했는지 다시 확인 (import org.springframework.transaction.annotation.Transactional;)
    public BlogDetailResponseDto getBlogDetails(Long blogId, int page, int size, Long loggedInUserId) {
        // 1. 블로그 조회 (Blog 엔티티에 User가 Eager 로딩되거나 fetch join 사용 권장)
        // Optional<Blog> optionalBlog = blogRepository.findById(blogId); // 기본 findById는 User를 Lazy 로딩할 수 있음
        // Fetch Join을 사용하는 레포지토리 메소드 추가 권장: 예) findByIdWithUser(Long blogId)
        Blog blog = blogRepository.findById(blogId)
                 .orElseThrow(() -> new IllegalArgumentException("블로그를 찾을 수 없습니다."));

        // Fetch Join을 사용하지 않았다면, 여기서 강제 초기화 (N+1 문제 발생 가능성 있음)
        // Hibernate.initialize(blog.getUser()); // 이미 getBlogDetails 메소드 하단에 있음. 필요하다면 조회 시점에 fetch join으로 해결

        // 2. 블로그 주인 유저 정보 확보
        User blogOwner = blog.getUser(); // Blog 엔티티에서 User 엔티티 가져오기
        Long ownerId = blogOwner.getId(); // <-- 블로그 주인 유저 ID 확보


        // 3. isFollowing 상태 계산
        boolean isFollowing = false; // 기본값: 팔로우하지 않음
        if (loggedInUserId != null && !loggedInUserId.equals(ownerId)) { // 로그인된 유저가 있고, 자신의 블로그가 아닌 경우에만 계산
        // 로그인된 유저 엔티티 조회 (팔로우 관계 확인 메소드가 User 엔티티를 받으므로 유저 엔티티가 필요합니다)
            Optional<User> loggedInUserOptional = userRepository.findById(loggedInUserId); // UserRepository 활용
            if (loggedInUserOptional.isPresent()) {
                User loggedInUser = loggedInUserOptional.get();
                // FollowRepository의 findByFollowerAndFollowing 메소드 활용 (User 엔티티 전달)
                isFollowing = followRepository.findByFollowerAndFollowing(loggedInUser, blogOwner).isPresent(); // <-- followManagementRepository -> followRepository 및 메소드 변경
            }
        }

        // 4. 팔로워/팔로잉 수 조회 (블로그 주인 유저의 ID로 조회)
        // FollowRepository의 countByFollowing/countByFollower 메소드 활용 (User 엔티티 전달)
        int followerCount = followRepository.countByFollowing(blogOwner).intValue(); // <-- followManagementRepository -> followRepository 및 메소드 변경 (Long to int)
        int followingCount = followRepository.countByFollower(blogOwner).intValue(); // <-- followManagementRepository -> followRepository 및 메소드 변경 (Long to int)


        // 5. 블로그의 게시물 목록 페이징 조회 (기존 코드 활용)
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<BoardListResponseDto> boards = boardService.getBoardsByBlogId(blogId, pageable); // BoardService 활용

        // 6. 게시글 총 수 (프론트 postsCount에 사용)
        // boardService.getBoardsByBlogId 결과에서 getTotalElements()를 사용
        Long totalPostsCount = boards.getTotalElements(); // Long 타입에 맞춤


        // 7. BlogDetailResponseDto 생성 및 반환
        return BlogDetailResponseDto.builder()
                .id(blog.getId())
                .name(blog.getName())
                .userName(blogOwner.getName()) // 유저 이름 설정
                .userEmail(blogOwner.getEmail()) // 유저 이메일 설정
                 // 유저 프로필 이미지 URL 가져오는 로직 필요 (User 엔티티 또는 별도 서비스)
                 // User 엔티티에 currentProfilePhoto 필드가 있으므로 활용
                .profileImage(blogOwner.getCurrentProfilePhoto() != null ? blogOwner.getCurrentProfilePhoto().getUrl() : null) // 프로필 이미지 URL 설정

                .postsCount(totalPostsCount) // 계산된 게시글 총 수 설정

                .ownerId(ownerId) // <-- 블로그 주인 유저 ID 설정 (필수!)
                .isFollowing(isFollowing) // <-- 계산된 isFollowing 상태 설정 (필수!)
                .followerCount(followerCount) // <-- 조회한 팔로워 수 설정 (필수!)
                .followingCount(followingCount) // <-- 조회한 팔로잉 수 설정 (필수!)

                .boards(boards) // 페이징된 게시물 목록 설정
                .build();
    }
}
