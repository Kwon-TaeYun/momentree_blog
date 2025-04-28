package com.likelion.momentreeblog.domain.photo.photo.controller;

import com.likelion.momentreeblog.config.security.dto.CustomUserDetails;
import com.likelion.momentreeblog.domain.photo.photo.dto.photo.PhotoUploadResponseDto;
import com.likelion.momentreeblog.domain.photo.photo.photoenum.PhotoType;
import com.likelion.momentreeblog.domain.photo.photo.service.PhotoV1Service;
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
public class ProfilePhotoApiV1Controller {

    private final PhotoV1Service photoService;


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
    @PutMapping("/default")
    public ResponseEntity<PreSignedUrlResponseDto> changeToDefaultProfilePhoto(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUserId();
        PreSignedUrlResponseDto preSignedUrlResponseDto = photoService.changeToDefaultPhoto(PhotoType.PROFILE, userId, null);
        return ResponseEntity.ok(preSignedUrlResponseDto);
    }


    // 사용자의 프로필 사진 변경
    @PostMapping("/profile-photo")
    public ResponseEntity<PhotoUploadResponseDto> updateCurrentProfilePhoto(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody PreSignedUrlResponseDto dto
    ) {
        Long userId = userDetails.getUserId();
        PhotoUploadRequestDto photoUploadRequestDto = PhotoUploadRequestDto.builder()
                .userId(userId)
                .photoType(PhotoType.PROFILE)
                .key(dto.getKey())
                .url(dto.getUrl())
                .build();

        PhotoUploadResponseDto responseDto = photoService.updatePhotoWithS3Key(PhotoType.PROFILE, userId, null, dto.getKey(), photoUploadRequestDto);
        return ResponseEntity.ok(responseDto);
    }
} 