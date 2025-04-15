package com.likelion.momentreeblog.domain.photo.photo.service;

import com.likelion.momentreeblog.domain.board.board.repository.BoardRepository;
import com.likelion.momentreeblog.domain.photo.photo.dto.BoardPhotoResponseDto;
import com.likelion.momentreeblog.domain.photo.photo.dto.PhotoUploadResponseDto;
import com.likelion.momentreeblog.domain.photo.photo.photoenum.PhotoType;
import com.likelion.momentreeblog.domain.photo.photo.repository.PhotoRepository;
import com.likelion.momentreeblog.domain.s3.dto.request.PhotoUploadRequestDto;
import com.likelion.momentreeblog.domain.s3.dto.response.PreSignedUrlResponseDto;
import com.likelion.momentreeblog.domain.s3.service.S3V1Service;
import com.likelion.momentreeblog.domain.user.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PhotoV2Service {
    private final ProfilePhotoService profilePhotoService;
    private final BoardPhotoService boardPhotoService;
    private final BoardRepository boardRepository;
    private final UserRepository userRepository;
    private final PhotoRepository photoRepository;
    private final S3V1Service s3V1Service;

    // 단일 사진 업로드 - 타입에 따라 적절한 서비스로 위임
    // PROFILE 타입은 프로필 사진, MAIN 타입은 게시글 대표 사진
    @Transactional
    public PreSignedUrlResponseDto uploadPhoto(PhotoUploadRequestDto request, Long userId, Long boardId) {
        if (request.getPhotoType() == PhotoType.ADDITIONAL) {
            throw new IllegalArgumentException("추가 사진은 uploadPhotos API를 사용해주세요.");
        } else if (request.getPhotoType() == PhotoType.PROFILE) {
            return profilePhotoService.uploadProfilePhoto(request);
        } else if (request.getPhotoType() == PhotoType.MAIN) {
            return boardPhotoService.uploadMainPhoto(request, userId, boardId);
        } else {
            throw new IllegalArgumentException("지원되지 않는 사진 타입입니다.");
        }
    }

    // 다중 사진 업로드 - 게시글 추가 사진 전용
    // ADDITIONAL 타입만 허용
    @Transactional
    public List<PreSignedUrlResponseDto> uploadPhotos(List<PhotoUploadRequestDto> requests, Long userId, Long boardId) {
        // 모든 요청의 사진 타입이 ADDITIONAL 인지 확인
        for (PhotoUploadRequestDto request : requests) {
            if (request.getPhotoType() != PhotoType.ADDITIONAL) {
                throw new IllegalArgumentException("추가 사진 업로드는 ADDITIONAL 타입만 가능합니다.");
            }
        }
        // 조건이 모두 만족하면 추가 사진 업로드 처리 메서드를 호출
        return boardPhotoService.uploadAdditionalPhotos(requests, userId, boardId);
    }



    @Transactional
    public PhotoUploadResponseDto updatePhotoWithS3Key(PhotoType type, Long userId, Long boardId, String s3Key, PhotoUploadRequestDto request) {
        if (type == PhotoType.PROFILE) {
            if (request.getPhotoType() != PhotoType.PROFILE) {
                throw new IllegalArgumentException("프로필 사진 타입이 아닙니다.");
            }
            return profilePhotoService.updateProfilePhotoWithS3Key(userId, s3Key, request);
        } else if (type == PhotoType.MAIN) {
            if (request.getPhotoType() != PhotoType.MAIN) {
                throw new IllegalArgumentException("게시글의 메인 사진 타입이 아닙니다.");
            }
            return boardPhotoService.updateBoardMainPhotoWithS3Key(boardId, s3Key, request);
        } else {
            throw new IllegalArgumentException("지원되지 않는 사진 타입입니다.");
        }
    }

    //단일 사진 조회 - 타입에 따라 적절한 서비스로 위임
    @Transactional(readOnly = true)
    public PreSignedUrlResponseDto getPhotoUrl(PhotoType type, Long id) {
        if (type == PhotoType.PROFILE) {
            // id는 userId로 취급
            return profilePhotoService.getProfilePhoto(id);
        } else if (type == PhotoType.MAIN) {
            // id는 boardId로 취급
            return boardPhotoService.getBoardMainPhoto(id);
        } else {
            throw new IllegalArgumentException("지원되지 않는 사진 조회 타입입니다.");
        }
    }

    // 사용자의 모든 프로필 사진 히스토리 조회
    @Transactional(readOnly = true)
    public List<PreSignedUrlResponseDto> getAllProfilePhotos(Long userId) {
        return profilePhotoService.getAllProfilePhotos(userId);
    }

    // 게시글의 모든 사진 조회 (대표 + 추가)
    @Transactional(readOnly = true)
    public BoardPhotoResponseDto getBoardPhotos(Long boardId) {
        return boardPhotoService.getBoardPhotos(boardId);
    }

    // 게시글의 추가 사진만 조회
    @Transactional(readOnly = true)
    public List<PreSignedUrlResponseDto> getBoardAdditionalPhotos(Long boardId) {
        return boardPhotoService.getBoardAdditionalPhotos(boardId);
    }

    // 사진 삭제 - 타입에 따라 적절한 서비스로 위임
    @Transactional
    public void deletePhoto(PhotoType type, Long userId, Long boardId) {
        if (type == PhotoType.PROFILE) {
            profilePhotoService.deleteProfilePhotos(userId);
        } else if (type == PhotoType.MAIN || type == PhotoType.ADDITIONAL) {
            boardPhotoService.deleteBoardPhotos(userId, boardId);
        } else {
            throw new IllegalArgumentException("지원되지 않는 사진 타입입니다.");
        }
    }

    // 프로필 사진을 기본 이미지로 변경
    @Transactional
    public void changeToDefaultProfilePhoto(Long userId) {
        profilePhotoService.changeToDefaultProfilePhoto(userId);
    }

    // 게시글 대표 사진을 기본 이미지로 변경
    @Transactional
    public void changeToDefaultBoardPhoto(Long userId, Long boardId) {
        boardPhotoService.changeToDefaultBoardPhoto(userId, boardId);
    }

    // 사용자의 프로필 사진 변경 (기존 사진 중에서 선택)
    @Transactional
    public void updateCurrentProfilePhoto(Long userId, Long photoId) {
        profilePhotoService.updateCurrentProfilePhoto(userId, photoId);
    }

    // 추가 사진을 대표 사진으로 변경
    @Transactional
    public void changeAdditionalToMainPhoto(Long userId, Long boardId, Long photoId) {
        boardPhotoService.changeAdditionalToMainPhoto(userId, boardId, photoId);
    }
}
