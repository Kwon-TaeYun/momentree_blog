package com.likelion.momentreeblog.domain.photo.photo.dto;

import com.likelion.momentreeblog.domain.s3.dto.response.PreSignedUrlResponseDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardPhotoResponseDto {
    private Long boardId;
    private PreSignedUrlResponseDto mainPhotoUrl;
    private List<PreSignedUrlResponseDto> additionalPhotoUrls;

} 