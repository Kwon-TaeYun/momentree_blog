package com.likelion.momentreeblog.domain.board.board.service;

import com.likelion.momentreeblog.domain.blog.blog.entity.Blog;
import com.likelion.momentreeblog.domain.blog.blog.repository.BlogRepository;
import com.likelion.momentreeblog.domain.board.board.dto.BoardDetailResponseDto;
import com.likelion.momentreeblog.domain.board.board.dto.BoardListResponseDto;
import com.likelion.momentreeblog.domain.board.board.dto.BoardRequestDto;
import com.likelion.momentreeblog.domain.board.board.dto.BoardResponseDto;
import com.likelion.momentreeblog.domain.board.board.entity.Board;
import com.likelion.momentreeblog.domain.board.board.repository.BoardRepository;
import com.likelion.momentreeblog.domain.board.category.entity.Category;
import com.likelion.momentreeblog.domain.board.category.repository.CategoryRepository;
import com.likelion.momentreeblog.domain.photo.photo.entity.Photo;
import com.likelion.momentreeblog.domain.photo.photo.photoenum.PhotoType;
import com.likelion.momentreeblog.domain.photo.photo.service.PhotoV1Service;
import com.likelion.momentreeblog.domain.photo.photo.service.board.BoardPhotoService;
import com.likelion.momentreeblog.domain.s3.dto.request.PhotoUploadRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardService {
    private final BoardRepository boardRepository;
    private final BlogRepository blogRepository;
    private final CategoryRepository categoryRepository;
    private final PhotoV1Service photoV1Service;
    private final BoardPhotoService boardPhotoService;
//    public boolean checkUserIsBlogOwner(Long userId, Long blogId) {
//        Blog blog = blogRepository.findById(blogId)
//                .orElseThrow(() -> new RuntimeException("블로그를 찾을 수 없습니다."));
//
//        return blog.getUser().getId().equals(userId);
//    }
    //게시글 작성
//    @Transactional
//    public String createBoard(BoardRequestDto requestDto, Long userId) {
//        Blog blog = blogRepository.findByUserId(userId)
//                .orElseThrow(() -> new IllegalArgumentException("블로그를 찾을 수 없습니다."));
//
//        Board board = new Board(requestDto, blog); // 생성자 수정 필요
//        Board savedBoard = boardRepository.save(board);
//
//        return "게시글 작성 완료(" + savedBoard.getTitle() + ")";
//    }

    @Transactional
    public String createBoard(BoardRequestDto requestDto, Long userId) {
        Blog blog = blogRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("블로그를 찾을 수 없습니다."));


        Category category;
        Long categoryId = requestDto.getCategoryId();

        if (categoryId == null) {
            category = categoryRepository.findByBlogAndIsDefaultTrue(blog)
                    .orElseGet(() -> {
                        Category defaultCategory = Category.builder()
                                .name("기본")
                                .blog(blog)
                                .isDefault(true)
                                .build();
                        return categoryRepository.save(defaultCategory);
                    });
        } else {
            category = categoryRepository.findById(categoryId)
                    .orElseThrow(() ->
                            new IllegalArgumentException("해당 카테고리가 없습니다. id=" + categoryId));
        }

        Board board = Board.builder()
                .blog(blog)
                .category(category)
                .title(requestDto.getTitle())
                .content(requestDto.getContent())
                .currentMainPhoto(null)
                .photos(new ArrayList<>())
                .build();
        boardRepository.save(board);


        // 대표 사진(Photo) 먼저 저장
        // dto.getCurrentMainPhotoUrl() 에는 프론트에서 보낸 S3 key 가 담겨있다.
        Photo mainPhoto = Photo.builder()
                .type(PhotoType.MAIN)
                .url(requestDto.getCurrentMainPhotoUrl())  // DTO에서 URL(=S3 key) 꺼내서
                .user(blog.getUser())
                .board(board)
                .build();
        board.setCurrentMainPhoto(mainPhoto);


        //추가 이미지가 있다면, 같은 순서로 추가 Photo도 저장
        for (String additionalUrl : requestDto.getPhotoUrls()) {
            board.getPhotos().add(
                    Photo.builder()
                            .type(PhotoType.ADDITIONAL)
                            .url(additionalUrl)
                            .user(blog.getUser())
                            .board(board)
                            .build()
            );
        }

        return "게시글 작성 완료(" + board.getTitle() + ")";
    }


    //게시글 수정
    @Transactional
    public String updateBoard(Long id, Long userId, BoardRequestDto requestDto) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시물"));

        Blog blog = blogRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저의 블로그가 존재하지 않습니다."));

        // 게시글의 주인인지 확인
        if (!board.getBlog().getId().equals(blog.getId())) {
            throw new SecurityException("게시글 수정 권한이 없습니다.");
        }

        // 3) 대표 사진 S3 → DB
        photoV1Service.updatePhotoWithS3Key(
                PhotoType.MAIN,
                userId,
                board.getId(),
                requestDto.getCurrentMainPhotoUrl(),
                PhotoUploadRequestDto.builder()
                        .photoType(PhotoType.MAIN)
                        .filename(null)
                        .contentType(null)
                        .build()
        );

        boardPhotoService.updateBoardAdditionalPhotosWithS3Keys(
                id,
                requestDto.getPhotoUrls(),
                PhotoUploadRequestDto.builder()
                        .photoType(PhotoType.ADDITIONAL)
                        .boardId(board.getId())
                        .contentType(null)
                        .filename(null)
                        .userId(blog.getUser().getId())
                        .build()
        );


        board.setTitle(requestDto.getTitle());
        board.setContent(requestDto.getContent());


        Board updatedBoard = boardRepository.save(board);
        return "게시글 수정 완료 (" + updatedBoard.getTitle() + ")";
    }

    @Transactional
    public String deleteBoard(Long id, Long userId) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시물"));

        Blog blog = blogRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저의 블로그가 존재하지 않습니다."));

        // 게시글의 주인인지 확인
        if (!board.getBlog().getId().equals(blog.getId())) {
            throw new SecurityException("게시글 삭제 권한이 없습니다.");
        }

        boardRepository.delete(board);
        return "게시글 삭제 완료";
    }


    //게시글 목록 조회 (타이틀과 블로그 ID만 반환)
    @Transactional
    public Page<BoardListResponseDto> getBoardList() {
        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        return boardRepository.findAll(pageable)
                .map(board -> new BoardListResponseDto(
                        board.getId(),
                        board.getTitle(),
                        board.getBlog().getId(),
                        board.getCurrentMainPhoto() != null ? board.getCurrentMainPhoto().getUrl() : null,
                        board.getLikes().stream().count()
                ));
    }

    @Transactional(readOnly = true)
    public Page<BoardListResponseDto> searchBoardsByContent(String keyword) {
        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Board> findBoard = boardRepository.findByContentContaining(keyword, pageable);

        return findBoard.map(board -> new BoardListResponseDto(
                board.getId(),
                board.getTitle(),
                board.getBlog().getId(),
                board.getCurrentMainPhoto() != null ? board.getCurrentMainPhoto().getUrl() : null,
                board.getLikes().stream().count()
        ));
    }

    @Transactional(readOnly = true)
    public BoardDetailResponseDto getBoardDetail(Long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시물입니다."));
        return BoardDetailResponseDto.from(board);
    }


    @Transactional(readOnly = true)
    public Page<BoardListResponseDto> searchBoardsByUserId(Long userId) {
        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Board> boards = boardRepository.findByBlog_User_Id(userId, pageable);

        return boards.map(board -> new BoardListResponseDto(
                board.getId(),
                board.getTitle(),
                board.getBlog().getId(),
                board.getCurrentMainPhoto() != null ? board.getCurrentMainPhoto().getUrl() : null,
                board.getLikes().stream().count()
        ));
    }
    @Transactional(readOnly = true)
    public List<BoardListResponseDto> getLatestPosts() {
        List<Board> boards = boardRepository.findTop3ByOrderByCreatedAtDesc();

        return boards.stream()
                .map(board -> new BoardListResponseDto(
                        board.getId(),
                        board.getTitle(),
                        board.getBlog().getId(),
                        board.getCurrentMainPhoto() != null ? board.getCurrentMainPhoto().getUrl() : null,
                        board.getLikes().stream().count()
                ))
                .collect(Collectors.toList());
    }
    @Transactional(readOnly = true)
    public List<BoardListResponseDto> getPopularPosts() {
        Pageable pageable = PageRequest.of(0, 5);

        List<Board> boards = boardRepository.findTop5ByLikeCount(pageable);

        return boards.stream()
                .map(board -> new BoardListResponseDto(
                        board.getId(),
                        board.getTitle(),
                        board.getBlog().getId(),
                        board.getCurrentMainPhoto() != null ? board.getCurrentMainPhoto().getUrl() : null,
                        board.getLikes().stream().count()
                ))
                .collect(Collectors.toList());
    }






}