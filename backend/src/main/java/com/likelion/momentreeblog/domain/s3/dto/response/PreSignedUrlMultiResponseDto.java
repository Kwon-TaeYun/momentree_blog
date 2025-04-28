package com.likelion.momentreeblog.domain.s3.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreSignedUrlMultiResponseDto {
    private List<PreSignedUrlResponseDto> urls;
}
