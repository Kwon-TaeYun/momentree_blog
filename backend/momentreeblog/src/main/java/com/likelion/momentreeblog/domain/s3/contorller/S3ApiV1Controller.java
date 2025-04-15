package com.likelion.momentreeblog.domain.s3.contorller;

import com.likelion.momentreeblog.domain.photo.photo.service.PhotoV2Service;
import com.likelion.momentreeblog.domain.s3.dto.request.PhotoUploadMultiRequestDto;
import com.likelion.momentreeblog.domain.s3.dto.request.PhotoUploadRequestDto;
import com.likelion.momentreeblog.domain.s3.dto.response.PreSignedUrlMultiResponseDto;
import com.likelion.momentreeblog.domain.s3.dto.response.PreSignedUrlResponseDto;
import com.likelion.momentreeblog.domain.s3.service.S3V1Service;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/s3")
@RequiredArgsConstructor
public class S3ApiV1Controller {

    private final S3V1Service s3V1Service;
    private final PhotoV2Service photoV2Service;

    /**
     * 프리사인 URL 요청 엔드포인트
     * 클라이언트는 사진 업로드 전 이 API를 호출해 S3에 PUT 요청할 수 있는 URL과 key를 받습니다.
     *
     * @param requestDto 업로드 요청 DTO (filename, photoType, userId, boardId)
     * @return PreSignedUrlResponseDto 프리사인 URL 및 S3 객체 key
     */
    @PostMapping("/presigned-url")
    public ResponseEntity<?> getPresignedUrl(@Valid @RequestBody PhotoUploadRequestDto requestDto, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            // 유효성 검사 실패 시 에러 메시지 반환
            return ResponseEntity.badRequest().body(bindingResult.getAllErrors());
        }

        // contentType은 파일 확장자나 업로드 상황에 따라 결정된다.
        PreSignedUrlResponseDto responseDto = s3V1Service.generatePresignedUrl(requestDto.getFilename(), requestDto.getContentType());
        return ResponseEntity.ok(responseDto);
    }



    //다중 파일 업로드용 프리사인 URL 제공 API
    @PostMapping("/multi-presigned-url")
    public ResponseEntity<?> getMultiPresignedUrl(@Valid @RequestBody PhotoUploadMultiRequestDto multiRequest,
                                                  BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(bindingResult.getAllErrors());
        }
        List<PhotoUploadRequestDto> requests = multiRequest.getPhotos();
        List<PreSignedUrlResponseDto> urls = s3V1Service.generatePutPresignedUrlMulti(requests);
        return ResponseEntity.ok(
                PreSignedUrlMultiResponseDto.builder().urls(urls).build()
        );
    }

}
