package com.likelion.momentreeblog.domain.s3.dto.request;

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

    private String filename; //파일 이름

    private PhotoType photoType;

    private String contentType; // PROFILE, MAIN, ADDITIONAL

    private Long userId;

    private Long boardId;

}
