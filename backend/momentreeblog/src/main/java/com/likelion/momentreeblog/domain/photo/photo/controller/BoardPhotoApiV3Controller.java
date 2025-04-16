package com.likelion.momentreeblog.domain.photo.photo.controller;

import com.likelion.momentreeblog.config.security.dto.CustomUserDetails;
import com.likelion.momentreeblog.domain.photo.photo.dto.board.AdditionalPhotoSaveRequest;
import com.likelion.momentreeblog.domain.photo.photo.dto.board.BoardPhotoResponseDto;
import com.likelion.momentreeblog.domain.photo.photo.dto.photo.PhotoUploadResponseDto;
import com.likelion.momentreeblog.domain.photo.photo.photoenum.PhotoType;
import com.likelion.momentreeblog.domain.photo.photo.service.BoardPhotoService;
import com.likelion.momentreeblog.domain.photo.photo.service.PhotoV2Service;
import com.likelion.momentreeblog.domain.s3.dto.request.PhotoUploadMultiRequestDto;
import com.likelion.momentreeblog.domain.s3.dto.request.PhotoUploadRequestDto;
import com.likelion.momentreeblog.domain.s3.dto.response.PreSignedUrlResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/V3/board/{boardId}/photos")
@RequiredArgsConstructor
public class BoardPhotoApiV3Controller {

    private final PhotoV2Service photoService;
    private final BoardPhotoService boardPhotoService;

    // 게시글 대표 사진 업로드용 presigned URL 생성
    @PostMapping("/main/upload")
    public ResponseEntity<PreSignedUrlResponseDto> getMainPhotoUploadUrl(
            @PathVariable Long boardId,
            @RequestBody PhotoUploadRequestDto request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        if (request.getPhotoType() != PhotoType.MAIN) {
            return ResponseEntity.badRequest().build();
        }

        Long userId = userDetails.getUserId();
        return ResponseEntity.ok(photoService.uploadPhoto(request, userId, boardId));
    }

    // 게시글 대표 사진 S3 업로드 완료 후 DB 저장
    @PutMapping("/update")
    public ResponseEntity<PhotoUploadResponseDto> updateBoardMainPhoto(
            @PathVariable Long boardId,
            @RequestParam("s3Key") String s3Key,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long userId = userDetails.getUserId();

        // Builder 패턴으로 DTO 생성
        PhotoUploadRequestDto request = PhotoUploadRequestDto.builder()
                .userId(userId)
                .boardId(boardId)
                .photoType(PhotoType.MAIN)
                .build();

        return ResponseEntity.ok(photoService.updatePhotoWithS3Key(PhotoType.MAIN, userId, boardId, s3Key, request));
    }

    // 게시글 추가 사진 업로드용 presigned URL 생성 (다중)
    @PostMapping("/additional/upload")
    public ResponseEntity<List<PreSignedUrlResponseDto>> getAdditionalPhotosUploadUrl(
            @PathVariable Long boardId,
            @RequestBody PhotoUploadMultiRequestDto request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long userId = userDetails.getUserId();
        return ResponseEntity.ok(photoService.uploadPhotos(request.getPhotos(), userId, boardId));
    }


    @PutMapping("/update/additional")
    public ResponseEntity<List<PhotoUploadResponseDto>> updateBoardAdditionalPhotos(
            @PathVariable Long boardId,
            @RequestBody List<AdditionalPhotoSaveRequest> requests,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long userId = userDetails.getUserId();

        // S3 키 목록 추출
        List<String> s3Keys = requests.stream()
                .map(AdditionalPhotoSaveRequest::getS3Key)
                .collect(Collectors.toList());

        // 기본 요청 정보 생성
        PhotoUploadRequestDto photoRequest = PhotoUploadRequestDto.builder()
                .photoType(PhotoType.ADDITIONAL)
                .userId(userId)
                .boardId(boardId)
                .build();

        // BoardPhotoService를 사용하여 여러 사진을 한 번에 처리
        List<PhotoUploadResponseDto> results = boardPhotoService.updateBoardAdditionalPhotosWithS3Keys(
                boardId, s3Keys, photoRequest);

        return ResponseEntity.ok(results);
    }


    // 게시글의 대표 사진 조회
    @GetMapping("/main")
    public ResponseEntity<PreSignedUrlResponseDto> getBoardMainPhoto(
            @PathVariable Long boardId) {
        return ResponseEntity.ok(photoService.getPhotoUrl(PhotoType.MAIN, boardId));
    }


    // 게시글의 현재 메인 사진들 조회
    @GetMapping("/current-main-photos")
    public ResponseEntity<List<PreSignedUrlResponseDto>> getAllUserCurrentMainPhotos(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUserId();
        return ResponseEntity.ok(photoService.getProfileOrMainPhotos(PhotoType.MAIN, userId));
    }


    // 게시글의 모든 사진 조회 (대표 + 추가)
    @GetMapping
    public ResponseEntity<BoardPhotoResponseDto> getBoardPhotos(
            @PathVariable Long boardId) {
        return ResponseEntity.ok(photoService.getBoardPhotos(PhotoType.MAIN, boardId));
    }


    // 게시글의 추가 사진만 조회
    @GetMapping("/additional")
    public ResponseEntity<List<PreSignedUrlResponseDto>> getBoardAdditionalPhotos(
            @PathVariable Long boardId) {
        return ResponseEntity.ok(photoService.getBoardAdditionalPhotos(PhotoType.ADDITIONAL, boardId));
    }


    // 게시글 사진 전체 삭제 (대표 + 추가)
    @DeleteMapping
    public ResponseEntity<String> deleteBoardPhotos(
            @PathVariable Long boardId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUserId();
        photoService.deletePhoto(PhotoType.MAIN, userId, boardId); // MAIN 타입을 전달해도 모든 사진이 삭제됨
        return ResponseEntity.ok().body("사진들을 삭제 했습니다");
    }


    // 게시글 대표 사진을 기본 이미지로 변경
    @PutMapping("/change/default-image")
    public ResponseEntity<String> changeToDefaultBoardPhoto(
            @PathVariable Long boardId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUserId();
        photoService.changeToDefaultPhoto(PhotoType.MAIN, userId, boardId);
        return ResponseEntity.ok().body("대표 사진을 기본 사진으로 변경했습니다");
    }


    // 추가 사진을 대표 사진으로 변경
    @PutMapping("/change-main/{photoId}")
    public ResponseEntity<String> changeAdditionalToMainPhoto(
            @PathVariable Long boardId,
            @PathVariable Long photoId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUserId();
        photoService.updateCurrentPhoto(PhotoType.ADDITIONAL, userId, boardId, photoId);
        return ResponseEntity.ok().body("사진을 대표사진으로 변경했습니다");
    }


} 