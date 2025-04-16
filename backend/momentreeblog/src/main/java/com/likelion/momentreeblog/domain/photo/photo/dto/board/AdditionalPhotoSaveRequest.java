package com.likelion.momentreeblog.domain.photo.photo.dto.board;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

//추가 사진 db 저장할때 쓸 요청 dto
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdditionalPhotoSaveRequest {
    private String s3Key;
} 