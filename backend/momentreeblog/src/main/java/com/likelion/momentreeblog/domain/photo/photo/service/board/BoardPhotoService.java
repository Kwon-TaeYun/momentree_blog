package com.likelion.momentreeblog.domain.photo.photo.service.board;

import com.likelion.momentreeblog.domain.board.board.entity.Board;
import com.likelion.momentreeblog.domain.board.board.repository.BoardRepository;
import com.likelion.momentreeblog.domain.photo.photo.dto.board.BoardPhotoResponseDto;
import com.likelion.momentreeblog.domain.photo.photo.dto.board.PhotoAlbumDto;
import com.likelion.momentreeblog.domain.photo.photo.dto.photo.PhotoUploadResponseDto;
import com.likelion.momentreeblog.domain.photo.photo.entity.Photo;
import com.likelion.momentreeblog.domain.photo.photo.photoenum.PhotoType;
import com.likelion.momentreeblog.domain.photo.photo.repository.PhotoRepository;
import com.likelion.momentreeblog.domain.s3.dto.request.PhotoUploadRequestDto;
import com.likelion.momentreeblog.domain.s3.dto.response.PreSignedUrlResponseDto;
import com.likelion.momentreeblog.domain.s3.service.S3V1Service;
import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.domain.user.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardPhotoService {
    private final PhotoRepository photoRepository;
    private final S3V1Service s3V1Service;
    private final BoardRepository boardRepository;
    private final UserRepository userRepository;

    private static final int MAX_ADDITIONAL_PHOTOS = 10;

    @Value("${custom.default-image.url}")
    private String DEFAULT_IMAGE_URL;


    // 게시글 대표 사진 업로드
    @Transactional
    public PreSignedUrlResponseDto uploadMainPhoto(PhotoUploadRequestDto request, Long userId, Long boardId) {
        if (request.getPhotoType() != PhotoType.MAIN) {
            throw new IllegalArgumentException("대표 사진 타입이 아닙니다.");
        }

        //게시물이 해당 유저의 것인지 확인
        verifyBoardAndUser(boardId, userId);

        return s3V1Service.generatePresignedUrl(request.getFilename(), request.getContentType());
    }


    // 게시글 추가 사진 업로드
    @Transactional
    public List<PreSignedUrlResponseDto> uploadAdditionalPhotos(List<PhotoUploadRequestDto> requests, Long userId, Long boardId) {
        // 게시물이 해당 유저의 소유인지 확인
        verifyBoardAndUser(boardId, userId);

        if (requests.isEmpty()) {
            throw new IllegalArgumentException("업로드할 사진이 없습니다.");
        }

        if (requests.size() > MAX_ADDITIONAL_PHOTOS) {
            throw new IllegalArgumentException("추가 사진은 최대 " + MAX_ADDITIONAL_PHOTOS + "장까지 업로드 가능합니다.");
        }

        for (PhotoUploadRequestDto request : requests) {
            if (request.getPhotoType() != PhotoType.ADDITIONAL) {
                throw new IllegalArgumentException("추가 사진 타입이 아닙니다.");
            }

            if (!boardId.equals(request.getBoardId()) || !userId.equals(request.getUserId())) {
                throw new IllegalArgumentException("모든 사진은 동일한 게시글과 사용자에 속해야 합니다.");
            }
        }

        List<PreSignedUrlResponseDto> result = new ArrayList<>();
        for (PhotoUploadRequestDto request : requests) {
            PreSignedUrlResponseDto urlResponse = s3V1Service.generatePresignedUrl(request.getFilename(), request.getContentType());
            result.add(urlResponse);
        }
        return result;
    }

    // 게시글의 모든 사진 조회 (대표 + 추가)
    @Transactional(readOnly = true)
    public BoardPhotoResponseDto getBoardPhotos(Long boardId) {
        // 게시글 존재 여부 확인
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시물이 존재하지 않습니다"));

        Photo mainPhoto = board.getCurrentMainPhoto();

        // 메인 사진이 없는 경우 기본 이미지 URL 사용
        PreSignedUrlResponseDto mainPhotoUrl;
        if (mainPhoto == null) {
            mainPhotoUrl = s3V1Service.generateGetPresignedUrl(DEFAULT_IMAGE_URL);
        } else {
            mainPhotoUrl = s3V1Service.generateGetPresignedUrl(mainPhoto.getUrl());
        }

        List<Photo> additionalPhotos = photoRepository.findByBoard_IdAndType(boardId, PhotoType.ADDITIONAL);

        return BoardPhotoResponseDto.builder()
                .boardId(boardId)
                .mainPhotoUrl(mainPhotoUrl)
                .additionalPhotoUrls(additionalPhotos.stream()
                        .map(photo -> s3V1Service.generateGetPresignedUrl(photo.getUrl()))
                        .collect(Collectors.toList()))
                .build();
    }


    // 사진첩 메서드
    @Transactional(readOnly = true)
    public List<PhotoAlbumDto> getAlbumByUser(Long userId) {


        // 사용자 별 MAIN 타입 사진을 가진 서로 다른 boardId 만 뽑는다
        List<Long> boardIds = photoRepository
                .findByUser_IdAndType(userId, PhotoType.MAIN)
                .stream()
                .map(photo -> photo.getBoard().getId())
                .distinct()      // 중복 제거
                .toList();

        // (2) boardId별로 DTO 하나씩 생성
        List<PhotoAlbumDto> album = new ArrayList<>();
        for (Long boardId : boardIds) {
            // 가장 최신 MAIN key
            Photo recentMain = photoRepository
                    .findFirstByBoardIdAndTypeOrderByCreatedAtDesc(boardId, PhotoType.MAIN)
                    .orElse(null);
            String mainKey = recentMain != null
                    ? recentMain.getUrl()
                    : DEFAULT_IMAGE_URL;
            //프리사인키 만들기
            String mainUrl = s3V1Service.generateGetPresignedUrl(mainKey).getUrl();


            // ADDITIONAL key 모으기
            List<Photo> adds = photoRepository.findByBoardIdAndType(boardId, PhotoType.ADDITIONAL);
            List<String> addKeys = adds.stream()
                    .map(Photo::getUrl)
                    .filter(url -> !url.equals(mainKey))  // 메인 키 제외
                    .distinct()
                    .collect(Collectors.toList());

            //프리사인 키 만들기
            List<String> addUrls = addKeys.stream()
                    .map(k -> s3V1Service.generateGetPresignedUrl(k).getUrl())
                    .collect(Collectors.toList());

            album.add(new PhotoAlbumDto(
                    userId,
                    boardId,
                    mainKey,
                    mainUrl,
                    addKeys,
                    addUrls
            ));
        }
        return album;
    }


    // 게시글의 추가 사진만 조회
    @Transactional(readOnly = true)
    public List<PreSignedUrlResponseDto> getBoardAdditionalPhotos(Long boardId) {
        // 게시글 존재 여부 확인
        if (!boardRepository.existsById(boardId)) {
            throw new IllegalArgumentException("해당 게시물이 존재하지 않습니다");
        }

        List<Photo> additionalPhotos = photoRepository.findByBoard_IdAndType(boardId, PhotoType.ADDITIONAL);

        return additionalPhotos.stream()
                .map(photo -> s3V1Service.generateGetPresignedUrl(photo.getUrl()))
                .collect(Collectors.toList());
    }


    // 게시글의 대표 사진만 조회
    @Transactional(readOnly = true)
    public PreSignedUrlResponseDto getBoardMainPhoto(Long boardId) {
        // 게시글 존재 여부 확인
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시물이 존재하지 않습니다"));

        Photo mainPhoto = board.getCurrentMainPhoto();

        // 메인 사진이 없는 경우 기본 이미지 URL 반환
        if (mainPhoto == null) {
            return s3V1Service.generateGetPresignedUrl(DEFAULT_IMAGE_URL);
        }

        return s3V1Service.generateGetPresignedUrl(mainPhoto.getUrl());
    }


    // 모든 게시물의 현재 대표 사진 조회
    @Transactional(readOnly = true)
    public List<PreSignedUrlResponseDto> getAllCurrentMainPhotosByUser(Long userId) {
        // 사용자의 모든 게시물 조회
        List<Board> userBoards = boardRepository.findByBlog_User_Id(userId);

        // 결과를 담을 리스트
        List<PreSignedUrlResponseDto> result = new ArrayList<>();

        // 각 게시물의 현재 대표 사진 조회
        for (Board board : userBoards) {
            Photo currentMainPhoto = board.getCurrentMainPhoto();

            // 현재 대표 사진이 없는 경우 기본 이미지 사용
            if (currentMainPhoto == null) {
                result.add(s3V1Service.generateGetPresignedUrl(DEFAULT_IMAGE_URL));
            } else {
                result.add(s3V1Service.generateGetPresignedUrl(currentMainPhoto.getUrl()));
            }
        }

        return result;
    }


    // 게시글 사진 삭제 및 업데이트
    @Transactional
    public void deleteBoardPhotos(Long userId, Long boardId) {
        // 게시글의 작성자가 맞는지 확인
        verifyBoardAndUser(boardId, userId);

        List<Photo> photos = new ArrayList<>();
        List<Photo> mainPhotos = photoRepository.findByBoard_IdAndType(boardId, PhotoType.MAIN);
        List<Photo> additionalPhotos = photoRepository.findByBoard_IdAndType(boardId, PhotoType.ADDITIONAL);
        photos.addAll(mainPhotos);
        photos.addAll(additionalPhotos);

        for (Photo photo : photos) {
            try {
                s3V1Service.deleteS3Object(photo.getUrl());
            } catch (Exception e) {
                throw new RuntimeException("S3에서 사진 삭제 실패: " + e.getMessage());
            }
        }

        Board board = boardRepository.findById(boardId).get();

        if (board.getCurrentMainPhoto() != null &&
                mainPhotos.stream().anyMatch(photo -> photo.getId().equals(board.getCurrentMainPhoto().getId()))) {
            board.setCurrentMainPhoto(null);
            boardRepository.save(board);
        }

        photoRepository.deleteAll(photos);
    }


    // 게시글 대표 사진 기본 이미지로 변경
    @Transactional
    public void changeToDefaultBoardPhoto(Long userId, Long boardId) {
        // 게시글 존재 여부 및 권한 확인
        verifyBoardAndUser(boardId, userId);

        Board board = boardRepository.findById(boardId).get();

        // 현재 대표 사진 정보 가져오기
        Photo currentMainPhoto = board.getCurrentMainPhoto();

        // 현재 대표 사진이 이미 null이라면 아무 작업도 수행하지 않음
        if (currentMainPhoto == null) {
            return;
        }

        // 현재 대표 사진 null로 설정 (기본 이미지로 표시됨)
        board.setCurrentMainPhoto(null);
        boardRepository.save(board);
    }


    // 추가 사진 중 하나를 대표 사진으로 변경
    @Transactional
    public void changeAdditionalToMainPhoto(Long userId, Long boardId, Long photoId) {
        // 게시글 권한 확인
        verifyBoardAndUser(boardId, userId);

        Board board = boardRepository.findById(boardId).get();

        // 사진 존재 확인
        Photo additionalPhoto = photoRepository.findById(photoId)
                .orElseThrow(() -> new NoSuchElementException("사진이 존재하지 않습니다. (ID: " + photoId + ")"));

        // 해당 사진이 요청한 게시글의 것인지 확인
        if (!additionalPhoto.getBoard().getId().equals(boardId)) {
            throw new IllegalArgumentException("해당 사진은 지정된 게시글에 속하지 않습니다.");
        }

        // 추가 사진인지 확인
        if (additionalPhoto.getType() != PhotoType.ADDITIONAL) {
            throw new IllegalArgumentException("추가 사진만 대표 사진으로 변경할 수 있습니다.");
        }

        // 해당 사진 타입을 MAIN으로 변경
        additionalPhoto.setType(PhotoType.MAIN);
        photoRepository.save(additionalPhoto);

        // 현재 대표 사진을 추가 사진으로 변경 (있는 경우)
        Photo currentMainPhoto = board.getCurrentMainPhoto();
        if (currentMainPhoto != null) {
            currentMainPhoto.setType(PhotoType.ADDITIONAL);
            photoRepository.save(currentMainPhoto);
        }

        // 새로운 대표 사진으로 설정
        board.setCurrentMainPhoto(additionalPhoto);
        boardRepository.save(board);
    }


    // 게시글 존재 확인 및 유저가 게시글을 작성했는지 확인하는 메서드
    private void verifyBoardAndUser(Long boardId, Long userId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow((() -> new IllegalArgumentException("해당 게시판이 없습니다")));
        if (!userId.equals(board.getBlog().getUser().getId())) {
            throw new RuntimeException("해당 게시글에 대한 권한이 없습니다");
        }
    }


    // S3 키를 이용하여 게시글 대표 사진 업데이트
    @Transactional
    public PhotoUploadResponseDto updateBoardMainPhotoWithS3Key(Long boardId, String s3Key, PhotoUploadRequestDto request) {
        // 게시글 조회 및 권한 검증
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new NoSuchElementException("해당 게시물을 찾을 수 없습니다. (ID: " + boardId + ")"));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new NoSuchElementException("해당 사용자를 찾을 수 없습니다."));

        // 게시글과 사용자의 관계 검증
        verifyBoardAndUser(boardId, user.getId());

        // 기존 Photo 조회
        Photo existing = photoRepository.findByBoardIdAndType(boardId, PhotoType.MAIN)
                .stream().findFirst().orElse(null);


        // S3 업로드 완료 후, 클라이언트가 전달한 s3Key를 사용하여 새 Photo 엔티티 생성
        Photo newMainPhoto = Photo.builder()
                .type(PhotoType.MAIN)
                .url(s3Key)
                .user(user)
                .board(board)
                .build();

        // 새 대표 사진을 DB에 저장
        Photo savedMainPhoto = photoRepository.save(newMainPhoto);

        // Board 엔티티의 대표 사진 필드를 업데이트
        board.setCurrentMainPhoto(savedMainPhoto);
        boardRepository.save(board);

        // 업데이트된 사진의 GET presigned URL 생성
        PreSignedUrlResponseDto urlDto = s3V1Service.generateGetPresignedUrl(savedMainPhoto.getUrl());

        // PhotoUploadResponseDto 형태로 결과 반환
        return PhotoUploadResponseDto.builder()
                .id(savedMainPhoto.getId())
                .url(urlDto.getUrl())
                .photoType(savedMainPhoto.getType())
                .boardId(board.getId())
                .userId(user.getId())
                .build();
    }


    // S3 키를 이용하여 게시글 추가 사진 여러 장 업데이트
    @Transactional
    public List<PhotoUploadResponseDto> updateBoardAdditionalPhotosWithS3Keys(Long boardId, List<String> s3Keys, PhotoUploadRequestDto request) {
        // 게시글 조회 및 권한 검증
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new NoSuchElementException("해당 게시물을 찾을 수 없습니다. (ID: " + boardId + ")"));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new NoSuchElementException("해당 사용자를 찾을 수 없습니다."));

        // 게시글과 사용자의 관계 검증
        verifyBoardAndUser(boardId, user.getId());

        // 결과를 담을 리스트
        List<Photo> newPhotos = new ArrayList<>();
        boolean needMainPhoto = board.getCurrentMainPhoto() == null && !s3Keys.isEmpty();

        // 모든 S3 키에 대해 Photo 엔티티 생성
        for (int i = 0; i < s3Keys.size(); i++) {
            PhotoType photoType = PhotoType.ADDITIONAL;

            // 첫 번째 사진이고 대표 사진이 필요한 경우에만 MAIN으로 설정
            if (i == 0 && needMainPhoto) {
                photoType = PhotoType.MAIN;
            }

            Photo newPhoto = Photo.builder()
                    .type(photoType)
                    .url(s3Keys.get(i))
                    .user(user)
                    .board(board)
                    .build();

            newPhotos.add(newPhoto);
        }

        // 모든 사진을 한 번에 DB에 저장
        List<Photo> savedPhotos = photoRepository.saveAll(newPhotos);

        // 대표 사진 설정이 필요한 경우
        if (needMainPhoto && !savedPhotos.isEmpty()) {
            Photo mainPhoto = savedPhotos.getFirst(); // 첫 번째 사진이 대표 사진
            board.setCurrentMainPhoto(mainPhoto);
            boardRepository.save(board);
        }

        // 결과 DTO 생성
        List<PhotoUploadResponseDto> results = new ArrayList<>();
        for (Photo savedPhoto : savedPhotos) {
            PreSignedUrlResponseDto urlDto = s3V1Service.generateGetPresignedUrl(savedPhoto.getUrl());

            results.add(PhotoUploadResponseDto.builder()
                    .id(savedPhoto.getId())
                    .url(urlDto.getUrl())
                    .photoType(savedPhoto.getType())
                    .boardId(board.getId())
                    .userId(user.getId())
                    .build());
        }

        return results;
    }
} 