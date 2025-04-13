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
public class PhotoUploadResponseDto {
    private Long id;
    private String url;
    private PhotoType photoType;
    private Long userId;
    private Long boardId;
} 