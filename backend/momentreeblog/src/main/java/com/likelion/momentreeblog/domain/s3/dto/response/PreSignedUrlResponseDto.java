package com.likelion.momentreeblog.domain.s3.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreSignedUrlResponseDto {
    private String url; // S3에 직접 PUT 요청할 프리사인 URL
    private String key; // S3에 저장될 객체 key (업로드 후 Photo 엔티티에 저장할 때 활용)
}