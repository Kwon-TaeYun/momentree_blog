package com.likelion.momentreeblog.domain.s3.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhotoUploadMultiRequestDto {

    //다중 사진 업로드를 위한 dto
    private List<PhotoUploadRequestDto> photos;
}
