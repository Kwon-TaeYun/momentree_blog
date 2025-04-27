package com.likelion.momentreeblog.domain.board.board.service;

import com.likelion.momentreeblog.domain.blog.blog.entity.Blog;
import com.likelion.momentreeblog.domain.blog.blog.repository.BlogRepository;
import com.likelion.momentreeblog.domain.board.board.dto.BoardDetailResponseDto;
import com.likelion.momentreeblog.domain.board.board.dto.BoardListResponseDto;
import com.likelion.momentreeblog.domain.board.board.dto.BoardMyBlogResponseDto;
import com.likelion.momentreeblog.domain.board.board.dto.BoardRequestDto;
import com.likelion.momentreeblog.domain.board.board.entity.Board;
import com.likelion.momentreeblog.domain.board.board.repository.BoardRepository;
import com.likelion.momentreeblog.domain.board.category.entity.Category;
import com.likelion.momentreeblog.domain.board.category.repository.CategoryRepository;
import com.likelion.momentreeblog.domain.photo.photo.entity.Photo;
import com.likelion.momentreeblog.domain.photo.photo.photoenum.PhotoType;
import com.likelion.momentreeblog.domain.photo.photo.repository.PhotoRepository;
import com.likelion.momentreeblog.domain.photo.photo.service.PhotoV1Service;
import com.likelion.momentreeblog.domain.s3.dto.request.PhotoUploadRequestDto;
import com.likelion.momentreeblog.domain.s3.dto.response.PreSignedUrlResponseDto;
import com.likelion.momentreeblog.domain.s3.service.S3V1Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BoardService {
    private final BoardRepository boardRepository;
    private final BlogRepository blogRepository;
    private final CategoryRepository categoryRepository;
    private final PhotoV1Service photoV1Service;
    private final PhotoRepository photoRepository;

    private final S3V1Service s3V1Service;

    @Value("${custom.default-image.url}")
    private String DEFAULT_IMAGE_URL;

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
                ? DEFAULT_IMAGE_URL
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
            // data:로 시작하는 임시 preview URL 이면 건너뛰기
            if (additionalUrl.startsWith("data:")) continue;

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

        // Markdown img 구문에서 key 집합 추출
        String markdown = requestDto.getContent();

        Pattern p = Pattern.compile("!\\[[^\\]]*\\]\\(([^)]+)\\)");
        Matcher m = p.matcher(markdown);
        Set<String> contentKeys = new HashSet<>();
        while (m.find()) {
            contentKeys.add(m.group(1));  // group(1)이 (  ) 안의 key
        }


        // 대표 사진(diff) 처리
        String newMainKey = requestDto.getCurrentMainPhotoUrl();
        Photo existingMain = photoRepository
                .findFirstByBoardIdAndTypeOrderByCreatedAtDesc(id, PhotoType.MAIN)
                .orElse(null);
        if (existingMain == null || !existingMain.getUrl().equals(newMainKey)) {
            photoV1Service.updatePhotoWithS3Key(
                    PhotoType.MAIN,
                    userId,
                    id,
                    newMainKey,
                    PhotoUploadRequestDto.builder()
                            .photoType(PhotoType.MAIN)
                            .boardId(id)
                            .userId(userId)
                            .build()
            );
        }

        // 추가 사진(diff) 처리
        List<Photo> existingAdditional =
                photoRepository.findByBoardIdAndType(id, PhotoType.ADDITIONAL);

        // 삭제
        existingAdditional .stream()
                .filter(photo -> !contentKeys.contains(photo.getUrl()))
                .forEach(photo -> {
                    board.getPhotos().remove(photo);
//                    photoV1Service.deletePhoto(PhotoType.ADDITIONAL,userId,id);
                    photoRepository.delete(photo);
                });

        // 추가
        Set<String> oldKeys = existingAdditional .stream().map(Photo::getUrl).collect(Collectors.toSet());
        for (String key : contentKeys) {
            if (!oldKeys.contains(key)) {
                photoRepository.save(Photo.builder()
                        .type(PhotoType.ADDITIONAL)
                        .url(key)
                        .user(board.getBlog().getUser())
                        .board(board)
                        .build());
            }
        }

        // 게시글 내용 업데이트
        board.setTitle(requestDto.getTitle());
        board.setContent(requestDto.getContent());


        // ✅ 카테고리 업데이트 추가
        if (requestDto.getCategoryId() != null) {
            Category category = categoryRepository.findById(requestDto.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("해당 카테고리가 존재하지 않습니다."));
            board.setCategory(category);
        }

        Board updated = boardRepository.save(board);
        return "게시글 수정 완료 (" + updated.getTitle() + ")";
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


    //게시글 상세 조회
    @Transactional(readOnly = true)
    public BoardDetailResponseDto getBoard(Long boardId) {

        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시물입니다"));

        log.info("유저 아이디" + board.getBlog().getUser().getId());
        PreSignedUrlResponseDto mainDto =
                photoV1Service.getPhotoUrl(PhotoType.MAIN, boardId);
        List<PreSignedUrlResponseDto> additionalDtos =
                photoV1Service.getBoardAdditionalPhotos(PhotoType.ADDITIONAL, boardId);
        PreSignedUrlResponseDto profileDto =
                photoV1Service.getPhotoUrl(PhotoType.PROFILE, board.getBlog().getUser().getId());

        return BoardDetailResponseDto.from(board, mainDto, additionalDtos, profileDto);
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
                        board.getLikes().stream().count(),
                        board.getCreatedAt()
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
                board.getLikes().stream().count(),
                board.getCreatedAt()
        ));
    }

//    @Transactional(readOnly = true)
//    public BoardDetailResponseDto getBoardDetail(Long id) {
//        Board board = boardRepository.findById(id)
//                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시물입니다."));
//        return BoardDetailResponseDto.from(board);
//    }


    @Transactional(readOnly = true)
    public Page<BoardMyBlogResponseDto> searchBoardsByUserId(Long userId) {
        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Board> boards = boardRepository.findByBlog_User_Id(userId, pageable);

        return boards.map(board -> {

            //board 단위의 메인 사진 presigned URL
            PreSignedUrlResponseDto mainPhotoDto = board.getCurrentMainPhoto() != null
                    ? photoV1Service.getPhotoUrl(PhotoType.MAIN, board.getId())
                    : null;

            // 프로필 사진 presigned URL
            PreSignedUrlResponseDto profilePhotoDto =
                    photoV1Service.getPhotoUrl(PhotoType.PROFILE, userId);

            // DTO 필드 타입에 맞게 리스트로 래핑
            List<PreSignedUrlResponseDto> mainPhotoList = mainPhotoDto != null
                    ? List.of(mainPhotoDto)
                    : List.of();

            return new BoardMyBlogResponseDto(
                    board.getId(),
                    board.getTitle(),
                    board.getBlog().getId(),
                    board.getLikes().stream().count(),
                    mainPhotoList,
                    profilePhotoDto,
                    board.getCreatedAt(),
                    board.getComments().stream().count()
            );

        });


    }

    @Transactional
    public Board getBoardWithLikes(Long boardId) {
        return boardRepository.findByIdWithLikes(boardId)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));
    }


    @Transactional(readOnly = true)
    public List<BoardListResponseDto> getLatestPosts() {
        List<Board> boards = boardRepository.findTopBoards(PageRequest.of(0, 3));

        return boards.stream()
                .map(board -> {
                    String key = Optional.ofNullable(board.getCurrentMainPhoto())
                            .map(photo -> photo.getUrl())
                            .orElse(DEFAULT_IMAGE_URL);

                    String publicUrl = s3V1Service.generateGetPresignedUrl(key).getPublicUrl();

                    return new BoardListResponseDto(
                            board.getId(),
                            board.getTitle(),
                            board.getBlog().getId(),
                            publicUrl,
                            board.getLikes().stream().count(),
                            board.getCreatedAt()
                    );
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BoardListResponseDto> getPopularPosts() {
        Pageable pageable = PageRequest.of(0, 5);

        List<Board> boards = boardRepository.findTop5ByLikeCount(pageable);

        return boards.stream()
                .map(board -> {
                    String key = Optional.ofNullable(board.getCurrentMainPhoto())
                            .map(photo -> photo.getUrl())
                            .orElse(DEFAULT_IMAGE_URL);

                    String publicUrl = s3V1Service.generateGetPresignedUrl(key).getPublicUrl();
                    return new BoardListResponseDto(
                            board.getId(),
                            board.getTitle(),
                            board.getBlog().getId(),
                            publicUrl,
                            board.getLikes().stream().count(),
                            board.getCreatedAt()
                    );
                        
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<BoardListResponseDto> getBoardsByBlogId(Long blogId, Pageable pageable) {
        Page<Board> boards = boardRepository.findByBlogId(blogId, pageable);
        return boards.map(board -> new BoardListResponseDto(
                board.getId(),
                board.getTitle(),
                board.getBlog().getId(),
                board.getCurrentMainPhoto() != null ? board.getCurrentMainPhoto().getUrl() : null,
                board.getLikes().stream().count(), // likeCount
                board.getCreatedAt()
        ));
    }
}






