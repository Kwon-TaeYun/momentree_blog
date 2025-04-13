package com.likelion.momentreeblog.domain.photo.photo.dto.request;

import com.likelion.momentreeblog.domain.photo.photo.photoenum.PhotoType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhotoUploadRequestDto {
    private String filename;
    private PhotoType photoType;
    private Long userId;
    private Long boardId; // 게시물 ID는 선택적 (프로필 사진의 경우 필요 없음)
}
