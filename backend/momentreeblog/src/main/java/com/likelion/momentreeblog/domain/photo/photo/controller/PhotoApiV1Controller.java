//package com.likelion.momentreeblog.domain.photo.photo.controller;
//
//
//import com.likelion.momentreeblog.domain.photo.photo.service.PhotoV1Service;
//import com.likelion.momentreeblog.domain.s3.dto.response.PreSignedUrlMultiResponseDto;
//import com.likelion.momentreeblog.domain.s3.dto.response.PreSignedUrlResponseDto;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/V1/photos")
//@RequiredArgsConstructor
//public class PhotoApiV1Controller {
//
//    private final PhotoV1Service photoV1Service;
//
//    //단일 사진 조회
//    @GetMapping("/{photoId}")
//    public ResponseEntity<?> getPhoto(@PathVariable(name = "photoId") Long photoId) {
//        PreSignedUrlResponseDto urlResponseDto = photoV1Service.getPhotoUrl(photoId);
//        return ResponseEntity.ok(urlResponseDto);
//    }
//
//    //다중 사진 조회
//    @GetMapping("/multiphoto")
//    public ResponseEntity<?> getMultiPhotos(@RequestBody List<String> keys) {
//        PreSignedUrlMultiResponseDto multiPhotoUrls = photoV1Service.getMultiPhotoUrls(keys);
//        return ResponseEntity.ok(multiPhotoUrls);
//    }
//
//
//    //단일 사진 삭제
//    @DeleteMapping("/{photoId}")
//    public ResponseEntity<?> deletePhoto(@PathVariable(name = "photoId") Long photoId) {
//        photoV1Service.deletePhoto(photoId);
//        return ResponseEntity.ok("사진이 성공적으로 삭제되었습니다");
//    }
//
//
//    //다중 사진 삭제
//    @DeleteMapping("/multiphoto")
//    public ResponseEntity<?> deleteMultiPhotos(@RequestBody List<Long> photoIds) {
//        photoV1Service.deletePhotoList(photoIds);
//        return ResponseEntity.ok("사진이 성공적으로 삭제 되었습니다");
//    }
//}
