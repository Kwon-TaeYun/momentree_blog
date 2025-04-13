package com.likelion.momentreeblog.domain.photo.photo.dto.response;

import com.likelion.momentreeblog.domain.photo.photo.photoenum.PhotoType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreSignedUrlResponseDto {
    private String url;          // 실제 파일이 저장될 URL
    private String presignedUrl; // 업로드용 임시 URL
    private PhotoType photoType;
}