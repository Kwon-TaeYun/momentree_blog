package com.likelion.momentreeblog.domain.board.board.service;

import com.likelion.momentreeblog.domain.blog.blog.entity.Blog;
import com.likelion.momentreeblog.domain.blog.blog.repository.BlogRepository;
import com.likelion.momentreeblog.domain.board.board.dto.BoardDetailResponseDto;
import com.likelion.momentreeblog.domain.board.board.dto.BoardEditResponseDto;
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
import com.likelion.momentreeblog.domain.s3.dto.response.PreSignedUrlResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    private static final String DEFAULT_BOARD_IMAGE_URL = "uploads/2976687f-037d-4907-a5a2-d7528a6eefd8-zammanbo.jpg";
//    public boolean checkUserIsBlogOwner(Long userId, Long blogId) {
//        Blog blog = blogRepository.findById(blogId)
//                .orElseThrow(() -> new RuntimeException("블로그를 찾을 수 없습니다."));
//
//        return blog.getUser().getId().equals(userId);
//    }
    //게시글 작성
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

        // 대표 사진 업로드 안했을때와 했을때 구별
        String mainPhotoKey = (requestDto.getCurrentMainPhotoUrl() == null
                || requestDto.getCurrentMainPhotoUrl().isBlank())
                ? DEFAULT_BOARD_IMAGE_URL
                : requestDto.getCurrentMainPhotoUrl();

        // dto.getCurrentMainPhotoUrl() 에는 프론트에서 보낸 S3 key 가 담겨있다.
        Photo mainPhoto = Photo.builder()
                .type(PhotoType.MAIN)
                .url(mainPhotoKey)  // DTO에서 URL(=S3 key) 꺼내서
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

        if (!board.getBlog().getId().equals(blog.getId())) {
            throw new SecurityException("게시글 수정 권한이 없습니다.");
        }

        // 대표 사진
        photoV1Service.updatePhotoWithS3Key(
                PhotoType.MAIN,
                userId,
                board.getId(),
                requestDto.getCurrentMainPhotoUrl(),
                PhotoUploadRequestDto.builder()
                        .photoType(PhotoType.MAIN)
                        .filename(null)
                        .contentType(null)
                        .boardId(id)
                        .userId(userId)
                        .build()
        );

        // 추가 사진
        boardPhotoService.updateBoardAdditionalPhotosWithS3Keys(
                id,
                requestDto.getPhotoUrls(),
                PhotoUploadRequestDto.builder()
                        .photoType(PhotoType.ADDITIONAL)
                        .boardId(id)
                        .contentType(null)
                        .filename(null)
                        .userId(userId)
                        .build()
        );

        board.setTitle(requestDto.getTitle());
        board.setContent(requestDto.getContent());

        // ✅ 카테고리 업데이트 추가
        if (requestDto.getCategoryId() != null) {
            Category category = categoryRepository.findById(requestDto.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("해당 카테고리가 존재하지 않습니다."));
            board.setCategory(category);
        }

        Board updatedBoard = boardRepository.save(board);
        return "게시글 수정 완료 (" + updatedBoard.getTitle() + ")";
    }




    //게시글 수정할때 게시글의 정보 받아오기
    @Transactional(readOnly = true)
    public BoardEditResponseDto getBoardEdit(Long boardId, Long userId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("해당 id의 게시물이 없습니다"));

        if (!userId.equals(board.getBlog().getUser().getId())) {
            throw new SecurityException("수정할 권한이 없습니다");
        }

        // 2) 메인 사진 URL (GET presigned URL)
        PreSignedUrlResponseDto mainPhotoDto =
                photoV1Service.getPhotoUrl(PhotoType.MAIN, boardId);

        List<PreSignedUrlResponseDto> additionalDtos =
                photoV1Service.getBoardAdditionalPhotos(PhotoType.ADDITIONAL, boardId);



        // 4) BoardEditResponseDto 빌드
        BoardEditResponseDto dto = new BoardEditResponseDto();
        dto.setId(board.getId());
        dto.setTitle(board.getTitle());
        dto.setContent(board.getContent());
        dto.setCurrentMainPhotoUrl(mainPhotoDto.getUrl());
        dto.setCurrentMainPhotoKey(mainPhotoDto.getKey());
        dto.setAdditionalPhotoUrls(
                additionalDtos.stream()
                        .map(PreSignedUrlResponseDto::getUrl)
                        .collect(Collectors.toList()));
        dto.setAdditionalPhotoKeys(
                additionalDtos.stream()
                        .map(PreSignedUrlResponseDto::getKey)
                        .collect(Collectors.toList()));
        dto.setCategory(board.getCategory());
        return dto;
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

    public Page<BoardListResponseDto> getBoardsByBlogId(Long blogId, Pageable pageable) {
        Page<Board> boards = boardRepository.findByBlogId(blogId, pageable);
        return boards.map(board -> new BoardListResponseDto(
                board.getId(),
                board.getTitle(),
                board.getBlog().getId(),
                board.getCurrentMainPhoto() != null ? board.getCurrentMainPhoto().getUrl() : null,
                board.getLikes().stream().count() // likeCount
        ));
    }





}