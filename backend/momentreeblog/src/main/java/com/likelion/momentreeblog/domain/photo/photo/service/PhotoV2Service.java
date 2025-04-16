package com.likelion.momentreeblog.domain.photo.photo.service;

import com.likelion.momentreeblog.domain.photo.photo.dto.board.BoardPhotoResponseDto;
import com.likelion.momentreeblog.domain.photo.photo.dto.photo.PhotoUploadResponseDto;
import com.likelion.momentreeblog.domain.photo.photo.photoenum.PhotoType;
import com.likelion.momentreeblog.domain.s3.dto.request.PhotoUploadRequestDto;
import com.likelion.momentreeblog.domain.s3.dto.response.PreSignedUrlResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PhotoV2Service {
    private final ProfilePhotoService profilePhotoService;
    private final BoardPhotoService boardPhotoService;


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


    // S3에 업로드 후에 엔티티에 반영하는 메서드
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


    // 단일 사진 조회 - 타입에 따라 적절한 서비스로 위임
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


    // 사용자의 프로필 사진과 현재 게시물 메인 사진 전체 조회 - 타입에 떄라 적절한 서비스로 위임
    @Transactional(readOnly = true)
    public List<PreSignedUrlResponseDto> getProfileOrMainPhotos(PhotoType type, Long userId) {
        if (type == PhotoType.PROFILE) {
            return profilePhotoService.getAllProfilePhotos(userId);
        } else if (type == PhotoType.MAIN) {
            return boardPhotoService.getAllCurrentMainPhotosByUser(userId);
        } else {
            throw new IllegalArgumentException("지원되지 않는 사진 조회 타입입니다.");
        }
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


    // 게시글 사진 조회 - 타입에 따라 적절한 서비스로 위임
    @Transactional(readOnly = true)
    public BoardPhotoResponseDto getBoardPhotos(PhotoType type, Long boardId) {
        if (type == PhotoType.MAIN || type == PhotoType.ADDITIONAL) {
            return boardPhotoService.getBoardPhotos(boardId);
        } else {
            throw new IllegalArgumentException("지원되지 않는 사진 조회 타입입니다.");
        }
    }


    // 게시글의 추가 사진 조회 - 타입에 따라 적절한 서비스로 위임
    @Transactional(readOnly = true)
    public List<PreSignedUrlResponseDto> getBoardAdditionalPhotos(PhotoType type, Long boardId) {
        if (type == PhotoType.ADDITIONAL) {
            return boardPhotoService.getBoardAdditionalPhotos(boardId);
        } else {
            throw new IllegalArgumentException("지원되지 않는 사진 조회 타입입니다.");
        }
    }


    // 사진을 기본 이미지로 변경 - 타입에 따라 적절한 서비스로 위임
    @Transactional
    public void changeToDefaultPhoto(PhotoType type, Long userId, Long boardId) {
        if (type == PhotoType.PROFILE) {
            profilePhotoService.changeToDefaultProfilePhoto(userId);
        } else if (type == PhotoType.MAIN) {
            boardPhotoService.changeToDefaultBoardPhoto(userId, boardId);
        } else {
            throw new IllegalArgumentException("지원되지 않는 사진 타입입니다.");
        }
    }


    // 특정 사진으로 현재 사진 변경 - 타입에 따라 적절한 서비스로 위임
    @Transactional
    public void updateCurrentPhoto(PhotoType type, Long userId, Long boardId, Long photoId) {
        if (type == PhotoType.PROFILE) {
            profilePhotoService.updateCurrentProfilePhoto(userId, photoId);
        } else if (type == PhotoType.ADDITIONAL) {
            boardPhotoService.changeAdditionalToMainPhoto(userId, boardId, photoId);
        } else {
            throw new IllegalArgumentException("지원되지 않는 사진 타입입니다.");
        }
    }
}
