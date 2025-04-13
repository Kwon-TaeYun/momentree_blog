package com.likelion.momentreeblog.domain.photo.photo.service;

import com.likelion.momentreeblog.domain.photo.photo.dto.request.PhotoUploadRequestDto;
import com.likelion.momentreeblog.domain.photo.photo.dto.response.PreSignedUrlResponseDto;
import com.likelion.momentreeblog.domain.photo.photo.photoenum.PhotoType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3ServiceV1 {

    private static final Duration PRESIGNED_URL_DURATION = Duration.ofMinutes(5);
    private static final String S3_URL_FORMAT = "https://%s.s3.%s.amazonaws.com/%s";

    private final S3Presigner s3Presigner;
    private final S3Client s3Client;

    @Value("${cloud.aws.region.static}")
    private String region;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    public PreSignedUrlResponseDto generatePresignedUrl(PhotoUploadRequestDto request) {
        String fileKey = createFileKey(request.getPhotoType(), request.getFilename());

        try {
            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                    .signatureDuration(PRESIGNED_URL_DURATION)
                    .putObjectRequest(req -> req
                            .bucket(bucket)
                            .key(fileKey)
                            .contentType("image/*"))
                    .build();

            PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);
            String presignedUrl = presignedRequest.url().toString();
            String fileUrl = String.format(S3_URL_FORMAT, bucket, region, fileKey);

            return PreSignedUrlResponseDto.builder()
                    .presignedUrl(presignedUrl)
                    .url(fileUrl)
                    .photoType(request.getPhotoType())
                    .build();

        } catch (S3Exception e) {
            log.error("S3 presigned URL 생성 실패: {}", e.getMessage());
            throw new RuntimeException("S3 presigned URL 생성에 실패했습니다.", e);
        }
    }

    private String createFileKey(PhotoType photoType, String filename) {
        return String.format("%s/%s-%s",
                photoType.toString().toLowerCase(),
                UUID.randomUUID(),
                filename);
    }
}
