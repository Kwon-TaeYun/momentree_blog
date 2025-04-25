package com.likelion.momentreeblog.domain.photo.photo.controller;

import com.likelion.momentreeblog.config.security.dto.CustomUserDetails;
import com.likelion.momentreeblog.domain.photo.photo.dto.board.BoardPhotoResponseDto;
import com.likelion.momentreeblog.domain.photo.photo.dto.board.PhotoAlbumDto;
import com.likelion.momentreeblog.domain.photo.photo.photoenum.PhotoType;
import com.likelion.momentreeblog.domain.photo.photo.service.PhotoV1Service;
import com.likelion.momentreeblog.domain.photo.photo.service.board.BoardPhotoService;
import com.likelion.momentreeblog.domain.s3.dto.response.PreSignedUrlResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/albums")
@RequiredArgsConstructor
public class BoardPhotoApiV1Controller {

    private final PhotoV1Service photoService;
    private final BoardPhotoService boardPhotoService;

    // 사진첩
    @GetMapping
    public ResponseEntity<List<PhotoAlbumDto>> getAlbum(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUserId();

        List<PhotoAlbumDto> albumDtos = boardPhotoService.getAlbumByUser(userId);
        return ResponseEntity.ok(albumDtos);
    }

    @GetMapping("/boards/{boardId}/photos")
    public ResponseEntity<BoardPhotoResponseDto> getPhotosByBoardId(
            @PathVariable(name = "boardId") Long boardId
    ) {
        BoardPhotoResponseDto boardPhotos = boardPhotoService.getBoardPhotos(boardId);
        return ResponseEntity.ok(boardPhotos);
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



    // 게시글의 추가 사진만 조회
    @GetMapping("boards/{boardId}/additional")
    public ResponseEntity<List<PreSignedUrlResponseDto>> getBoardAdditionalPhotos(
            @PathVariable Long boardId) {
        return ResponseEntity.ok(photoService.getBoardAdditionalPhotos(PhotoType.ADDITIONAL, boardId));
    }


    // 게시글의 대표 사진 조회
    @GetMapping("/main")
    public ResponseEntity<PreSignedUrlResponseDto> getBoardMainPhoto(
            @PathVariable Long boardId) {
        return ResponseEntity.ok(photoService.getPhotoUrl(PhotoType.MAIN, boardId));
    }


    //게시글의 대표 사진들 조회
    @GetMapping("/main/all")
    public ResponseEntity<List<PreSignedUrlResponseDto>> getBoardsCurrentMainPhotos(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUserId();
        return ResponseEntity.ok(photoService.getProfileOrMainPhotos(PhotoType.MAIN, userId));
    }


    // 게시글의 현재 메인 사진들 조회
    @GetMapping("/current-main-photos")
    public ResponseEntity<List<PreSignedUrlResponseDto>> getAllUserCurrentMainPhotos(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUserId();
        return ResponseEntity.ok(photoService.getProfileOrMainPhotos(PhotoType.MAIN, userId));
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