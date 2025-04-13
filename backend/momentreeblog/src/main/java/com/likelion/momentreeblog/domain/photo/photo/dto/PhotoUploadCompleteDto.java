package com.likelion.momentreeblog.domain.photo.photo.dto;

import com.likelion.momentreeblog.domain.photo.photo.photoenum.PhotoType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PhotoUploadCompleteDto {
    private String url;
    private PhotoType photoType;
    private Long userId;
    private Long boardId;
}
