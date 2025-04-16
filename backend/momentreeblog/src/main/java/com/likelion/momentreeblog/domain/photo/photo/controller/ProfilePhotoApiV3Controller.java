package com.likelion.momentreeblog.domain.photo.photo.controller;

import com.likelion.momentreeblog.config.security.dto.CustomUserDetails;
import com.likelion.momentreeblog.domain.photo.photo.dto.photo.PhotoUploadResponseDto;
import com.likelion.momentreeblog.domain.photo.photo.photoenum.PhotoType;
import com.likelion.momentreeblog.domain.photo.photo.service.PhotoV2Service;
import com.likelion.momentreeblog.domain.s3.dto.request.PhotoUploadRequestDto;
import com.likelion.momentreeblog.domain.s3.dto.response.PreSignedUrlResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/V3/profile/photos")
@RequiredArgsConstructor
public class ProfilePhotoApiV3Controller {

    private final PhotoV2Service photoService;


    // 프로필 사진 업로드용 presigned URL 생성
    @PostMapping("/upload")
    public ResponseEntity<PreSignedUrlResponseDto> getProfileUploadUrl(
            @RequestBody PhotoUploadRequestDto request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        if (request.getPhotoType() != PhotoType.PROFILE) {
            return ResponseEntity.badRequest().build();
        }
        
        Long userId = userDetails.getUserId();
        return ResponseEntity.ok(photoService.uploadPhoto(request, userId, null));
    }


    // 프로필 사진 S3 업로드 완료 후 DB 저장
    @PutMapping("/update")
    public ResponseEntity<PhotoUploadResponseDto> updateProfilePhoto(
            @RequestParam("s3Key") String s3Key,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Long userId = userDetails.getUserId();
        
        // Builder 패턴으로 DTO 생성
        PhotoUploadRequestDto request = PhotoUploadRequestDto.builder()
                .userId(userId)
                .photoType(PhotoType.PROFILE)
                .build();
        
        return ResponseEntity.ok(photoService.updatePhotoWithS3Key(PhotoType.PROFILE, userId, null, s3Key, request));
    }

    // 현재 프로필 사진 조회
    @GetMapping
    public ResponseEntity<PreSignedUrlResponseDto> getCurrentProfilePhoto(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUserId();
        return ResponseEntity.ok(photoService.getPhotoUrl(PhotoType.PROFILE, userId));
    }


    // 프로필 사진들 조회
    @GetMapping("/profile-photos")
    public ResponseEntity<List<PreSignedUrlResponseDto>> getProfilePhotoHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUserId();
        return ResponseEntity.ok(photoService.getProfileOrMainPhotos(PhotoType.PROFILE, userId));
    }


    // 프로필 사진 삭제
    @DeleteMapping
    public ResponseEntity<String> deleteProfilePhoto(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUserId();
        photoService.deletePhoto(PhotoType.PROFILE, userId, null);
        return ResponseEntity.ok().body("프로필 사진 삭제 완료했습니다");
    }


    // 프로필 사진을 기본 이미지로 변경
    @PutMapping("/change/default-image")
    public ResponseEntity<String> changeToDefaultProfilePhoto(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUserId();
        photoService.changeToDefaultPhoto(PhotoType.PROFILE, userId, null);
        return ResponseEntity.ok().body("프로필 사진을 기본사진으로 변경했습니다");
    }


    // 사용자의 프로필 사진 변경 (기존 사진 중에서 선택)
    @PutMapping("/change/{photoId}")
    public ResponseEntity<String> updateCurrentProfilePhoto(
            @PathVariable Long photoId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUserId();
        photoService.updateCurrentPhoto(PhotoType.PROFILE, userId, null, photoId);
        return ResponseEntity.ok().body("사진을 프로필 사진으로 변경 완료했습니다");
    }

} 