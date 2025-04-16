package com.likelion.momentreeblog.domain.photo.photo.service.profile;

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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ProfilePhotoService {
    private final PhotoRepository photoRepository;
    private final S3V1Service s3V1Service;
    private final UserRepository userRepository;

    // 기본 프로필 이미지 URL (S3에 미리 업로드된 기본 이미지 URL)
    private static final String DEFAULT_PROFILE_IMAGE_URL = "uploads/2976687f-037d-4907-a5a2-d7528a6eefd8-zammanbo.jpg";

    
    // 프로필 사진 업로드
    @Transactional
    public PreSignedUrlResponseDto uploadProfilePhoto(PhotoUploadRequestDto request) {
        if (request.getPhotoType() != PhotoType.PROFILE) {
            throw new IllegalArgumentException("프로필 사진 타입이 아닙니다.");
        }
        
        // 사용자 존재 확인
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다. (ID: " + request.getUserId() + ")"));
        
        return s3V1Service.generatePresignedUrl(request.getFilename(), request.getContentType());
    }


    // 현재 프로필 사진 조회
    @Transactional(readOnly = true)
    public PreSignedUrlResponseDto getProfilePhoto(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다. (ID: " + userId + ")"));
        
        Photo currentProfilePhoto = user.getCurrentProfilePhoto();
        if (currentProfilePhoto == null) {
            // 현재 프로필 사진이 없는 경우 기본 이미지 URL 반환
            return s3V1Service.generateGetPresignedUrl(DEFAULT_PROFILE_IMAGE_URL);
        }
        
        return s3V1Service.generateGetPresignedUrl(currentProfilePhoto.getUrl());
    }


    // 사용자의 모든 프로필 사진 히스토리 조회
    @Transactional(readOnly = true)
public List<PreSignedUrlResponseDto> getAllProfilePhotos(Long userId) {
    List<Photo> profilePhotos = photoRepository.findByUser_IdAndType(userId, PhotoType.PROFILE);
    
    List<PreSignedUrlResponseDto> result = new ArrayList<>();
    
    // 프로필 사진이 없는 경우 기본 이미지 추가
    if (profilePhotos.isEmpty()) {
        result.add(s3V1Service.generateGetPresignedUrl(DEFAULT_PROFILE_IMAGE_URL));
    } else {
        for (Photo photo : profilePhotos) {
            result.add(s3V1Service.generateGetPresignedUrl(photo.getUrl()));
        }
    }
    
    return result;
}


    // 프로필 사진 삭제
    @Transactional
    public void deleteProfilePhotos(Long userId) {
        List<Photo> profilePhotos = photoRepository.findByUser_IdAndType(userId, PhotoType.PROFILE);
        
        for (Photo profilePhoto : profilePhotos) {
            try {
                if (!profilePhoto.getType().equals(PhotoType.PROFILE)) {
                    throw new RuntimeException("해당 타입은 삭제할 수 없습니다");
                }
                s3V1Service.deleteS3Object(profilePhoto.getUrl());
            } catch (Exception e) {
                throw new RuntimeException("S3에서 사진 삭제 실패: " + e.getMessage());
            }
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저를 찾을 수 없습니다"));
        
        if (user.getCurrentProfilePhoto() != null && 
            profilePhotos.stream().anyMatch(photo -> photo.getId().equals(user.getCurrentProfilePhoto().getId()))) {
            user.setCurrentProfilePhoto(null);
            userRepository.save(user);
        }
        
        photoRepository.deleteAll(profilePhotos);
    }


    // 프로필 사진 기본 사진으로 변경
    @Transactional
    public void changeToDefaultProfilePhoto(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다. (ID: " + userId + ")"));
        
        // 현재 프로필 사진 정보 가져오기
        Photo currentPhoto = user.getCurrentProfilePhoto();
        
        // 현재 프로필 사진이 이미 null이라면 아무 작업도 수행하지 않음
        if (currentPhoto == null) {
            return;
        }
        
        // 현재 프로필 사진 null로 설정 (기본 이미지로 표시됨)
        user.setCurrentProfilePhoto(null);
        userRepository.save(user);
        
        // 기본 이미지로 변경되었음을 로그로 남기거나 이벤트 발행 가능
        // logger.info("User {} changed to default profile image", userId);
    }



    // 사용자의 프로필 사진 변경 (기존 사진 중에서 선택)
    @Transactional
    public void updateCurrentProfilePhoto(Long userId, Long photoId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다. (ID: " + userId + ")"));
        
        Photo newProfilePhoto = photoRepository.findById(photoId)
                .orElseThrow(() -> new NoSuchElementException("사진을 찾을 수 없습니다. (ID: " + photoId + ")"));
        
        // 본인 소유의 사진인지 확인
        if (!newProfilePhoto.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("해당 사진을 프로필로 설정할 권한이 없습니다.");
        }
        
        // 프로필 타입의 사진인지 확인
        if (!newProfilePhoto.getType().equals(PhotoType.PROFILE)) {
            throw new IllegalArgumentException("프로필 사진 타입이 아닙니다.");
        }
        
        // 현재 프로필 사진 업데이트
        user.setCurrentProfilePhoto(newProfilePhoto);
        userRepository.save(user);
    }


    // S3 키를 이용하여 프로필 사진 업데이트
    @Transactional
    public PhotoUploadResponseDto updateProfilePhotoWithS3Key(Long userId, String s3Key, PhotoUploadRequestDto request) {
        // 사용자 존재 여부 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("해당 사용자를 찾을 수 없습니다."));

        // S3 업로드 완료 후, 클라이언트가 전달한 s3Key를 사용하여 새 Photo 엔티티 생성
        Photo newProfilePhoto = Photo.builder()
                .type(PhotoType.PROFILE)
                .url(s3Key)
                .user(user)
                .build();

        // 새 프로필 사진을 DB에 저장
        Photo savedProfilePhoto = photoRepository.save(newProfilePhoto);

        // User 엔티티의 프로필 사진 필드를 업데이트
        user.setCurrentProfilePhoto(savedProfilePhoto);
        userRepository.save(user);

        // 업데이트된 사진의 GET presigned URL 생성
        PreSignedUrlResponseDto urlDto = s3V1Service.generateGetPresignedUrl(savedProfilePhoto.getUrl());

        // PhotoUploadResponseDto 형태로 결과 반환
        return PhotoUploadResponseDto.builder()
                .id(savedProfilePhoto.getId())
                .url(urlDto.getUrl())
                .photoType(savedProfilePhoto.getType())
                .userId(user.getId())
                .build();
    }
} 