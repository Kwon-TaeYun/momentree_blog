package com.likelion.momentreeblog.domain.s3.service;

import com.likelion.momentreeblog.domain.s3.dto.request.PhotoUploadRequestDto;
import com.likelion.momentreeblog.domain.s3.dto.response.PreSignedUrlResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3V1Service {

    private final S3Presigner s3Presigner;
    private final S3Client s3Client;


    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;

    // 최대 다중 업로드 개수 제한
    private static final int MAX_UPLOAD_COUNT = 15;


    //@param originalFileName 클라이언트가 전송한 원본 파일명
    //@param contentType      파일의 Content-Type (예: image/jpeg)
    //사진 단일 업로드(PUT) presigned URL 생성
    //사진 업로드를 위한 프리사인 URL을 생성하는 메서드 구현
    public PreSignedUrlResponseDto generatePresignedUrl(String originalFileName, String contentType) {

        // 사진이 저장될 S3의 key 생성 (예: uploads/랜덤UUID-파일명) - url
        String key = "uploads/" + UUID.randomUUID().toString() + "-" + originalFileName;


        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(contentType)
                .build();


        // 프리사인 URL 생성: 5분간 유효
        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(5))
                .putObjectRequest(putObjectRequest)
                .build();

        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);
        String url = presignedRequest.url().toString();

        return PreSignedUrlResponseDto.builder()
                .url(url)
                .key(key)
                .build();
    }


    //다중 사진 업로드용 presignedUrl 생성
    public List<PreSignedUrlResponseDto> generatePutPresignedUrlMulti(List<PhotoUploadRequestDto> requests) {
        if (requests.size() > MAX_UPLOAD_COUNT) {
            throw new IllegalArgumentException("한 번에 최대 " + MAX_UPLOAD_COUNT + "장만 업로드할 수 있습니다.");
        }
        List<PreSignedUrlResponseDto> result = new ArrayList<>();
        for (PhotoUploadRequestDto request : requests) {
            result.add(generatePresignedUrl(request.getFilename(), request.getContentType()));
        }
        return result;
    }



    //단일 사진 조회(GET) presigned URL 생성
    public PreSignedUrlResponseDto generateGetPresignedUrl(String key) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .getObjectRequest(getObjectRequest)
                .signatureDuration(Duration.ofMinutes(15))
                .build();

        PresignedGetObjectRequest presignedGetObjectRequest = s3Presigner.presignGetObject(presignRequest);
        String url = presignedGetObjectRequest.url().toString();

        return PreSignedUrlResponseDto.builder()
                .url(url)
                .key(key)
                .build();
    }


    //사진 다중 조회용 presigned URL 생성
    public List<PreSignedUrlResponseDto> generateGetPresignedUrlMulti(List<String> keys) {
        List<PreSignedUrlResponseDto> result = new ArrayList<>();
        for (String key : keys) {
            result.add(generateGetPresignedUrl(key));
        }
        return result;
    }




    // S3에서 객체 삭제
    public void deleteS3Object(String key) {
        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();
            s3Client.deleteObject(deleteObjectRequest);
        } catch (S3Exception e) {
            log.error("S3 객체 삭제 실패: {}", e.getMessage());
            throw new RuntimeException("S3에서 객체 삭제 실패: " + e.getMessage(), e);
        }
    }


}
