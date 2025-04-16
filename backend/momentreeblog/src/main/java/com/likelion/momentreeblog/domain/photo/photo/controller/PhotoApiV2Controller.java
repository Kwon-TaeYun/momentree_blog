//package com.likelion.momentreeblog.domain.photo.photo.controller;
//
//import com.likelion.momentreeblog.config.security.dto.CustomUserDetails;
//import com.likelion.momentreeblog.domain.photo.photo.dto.board.BoardPhotoResponseDto;
//import com.likelion.momentreeblog.domain.photo.photo.photoenum.PhotoType;
//import com.likelion.momentreeblog.domain.photo.photo.service.PhotoV2Service;
//import com.likelion.momentreeblog.domain.s3.dto.request.PhotoUploadMultiRequestDto;
//import com.likelion.momentreeblog.domain.s3.dto.request.PhotoUploadRequestDto;
//import com.likelion.momentreeblog.domain.s3.dto.response.PreSignedUrlResponseDto;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.annotation.AuthenticationPrincipal;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
///**
// * 레거시 API 컨트롤러
// * 이전 버전과의 호환성을 위해 유지됨
// * 새로운 구현은 ProfilePhotoApiController와 BoardPhotoApiController 사용 권장
// */
//@RestController
//@RequestMapping("/api/v2/photos") // v2에서 v1으로 변경하여 새 컨트롤러와 충돌 방지
//@RequiredArgsConstructor
//@Deprecated // 이 컨트롤러는 레거시로 표시
//public class PhotoApiV2Controller {
//
//    private final PhotoV2Service photoService;
//
//    // 단일 사진 업로드용 presigned URL 생성
//    @PostMapping("/upload")
//    public ResponseEntity<PreSignedUrlResponseDto> getUploadUrl(
//            @RequestBody PhotoUploadRequestDto request,
//            @AuthenticationPrincipal CustomUserDetails userDetails) {
//
//        Long userId = userDetails.getUserId();
//        Long boardId = request.getBoardId(); // 게시글 ID 확인
//        return ResponseEntity.ok(photoService.uploadPhoto(request, userId, boardId));
//    }
//
//    // 다중 사진 업로드용 presigned URL 생성
//    @PostMapping("/upload/multi")
//    public ResponseEntity<List<PreSignedUrlResponseDto>> getMultiUploadUrls(
//            @RequestBody PhotoUploadMultiRequestDto request,
//            @AuthenticationPrincipal CustomUserDetails userDetails) {
//        Long userId = userDetails.getUserId();
//        Long boardId = null;
//
//        // 모든 요청이 동일한 boardId를 가지는지 확인
//        if (!request.getPhotos().isEmpty()) {
//            boardId = request.getPhotos().get(0).getBoardId();
//        }
//
//        return ResponseEntity.ok(photoService.uploadPhotos(request.getPhotos(), userId, boardId));
//    }
//
//    // 단일 사진 조회 (타입에 따라 프로필 또는 게시글 대표 사진)
//    @GetMapping("/{id}")
//    public ResponseEntity<PreSignedUrlResponseDto> getPhoto(
//            @PathVariable Long id,
//            @RequestParam PhotoType type) {
//        return ResponseEntity.ok(photoService.getPhotoUrl(type, id));
//    }
//
//    // 프로필 사진 히스토리 조회
//    @GetMapping("/profile/history")
//    public ResponseEntity<List<PreSignedUrlResponseDto>> getProfilePhotoHistory(
//            @AuthenticationPrincipal CustomUserDetails userDetails) {
//        Long userId = userDetails.getUserId();
//        return ResponseEntity.ok(photoService.getAllProfilePhotos(userId));
//    }
//
//    // 게시글의 모든 사진 조회 (대표 + 추가)
//    @GetMapping("/board/{boardId}")
//    public ResponseEntity<BoardPhotoResponseDto> getBoardPhotos(
//            @PathVariable Long boardId) {
//        return ResponseEntity.ok(photoService.getBoardPhotos(boardId));
//    }
//
//    // 게시글의 추가 사진만 조회
//    @GetMapping("/board/{boardId}/additional")
//    public ResponseEntity<List<PreSignedUrlResponseDto>> getBoardAdditionalPhotos(
//            @PathVariable Long boardId) {
//        return ResponseEntity.ok(photoService.getBoardAdditionalPhotos(boardId));
//    }
//
//    // 사진 삭제
//    @DeleteMapping("/delete")
//    public ResponseEntity<Void> deletePhoto(
//            @RequestParam PhotoType type,
//            @RequestParam(required = false) Long boardId,
//            @AuthenticationPrincipal CustomUserDetails userDetails) {
//        Long userId = userDetails.getUserId();
//        photoService.deletePhoto(type, userId, boardId);
//        return ResponseEntity.ok().build();
//    }
//
//    // 프로필 사진을 기본 이미지로 변경
//    @PutMapping("/profile/default")
//    public ResponseEntity<Void> changeToDefaultProfilePhoto(
//            @AuthenticationPrincipal CustomUserDetails userDetails) {
//        Long userId = userDetails.getUserId();
//        photoService.changeToDefaultProfilePhoto(userId);
//        return ResponseEntity.ok().build();
//    }
//
//    // 게시글 대표 사진을 기본 이미지로 변경
//    @PutMapping("/board/{boardId}/default")
//    public ResponseEntity<Void> changeToDefaultBoardPhoto(
//            @PathVariable Long boardId,
//            @AuthenticationPrincipal CustomUserDetails userDetails) {
//        Long userId = userDetails.getUserId();
//        photoService.changeToDefaultBoardPhoto(userId, boardId);
//        return ResponseEntity.ok().build();
//    }
//
//    // 추가 사진을 대표 사진으로 변경
//    @PutMapping("/board/{boardId}/change-main/{photoId}")
//    public ResponseEntity<Void> changeAdditionalToMainPhoto(
//            @PathVariable Long boardId,
//            @PathVariable Long photoId,
//            @AuthenticationPrincipal CustomUserDetails userDetails) {
//        Long userId = userDetails.getUserId();
//        photoService.changeAdditionalToMainPhoto(userId, boardId, photoId);
//        return ResponseEntity.ok().build();
//    }
//
//    // 사용자의 프로필 사진 변경 (기존 사진 중에서 선택)
//    @PutMapping("/profile/change/{photoId}")
//    public ResponseEntity<Void> updateCurrentProfilePhoto(
//            @PathVariable Long photoId,
//            @AuthenticationPrincipal CustomUserDetails userDetails) {
//        Long userId = userDetails.getUserId();
//        photoService.updateCurrentProfilePhoto(userId, photoId);
//        return ResponseEntity.ok().build();
//    }
//}