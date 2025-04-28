package com.likelion.momentreeblog.domain.photo.photo.dto.board;

import com.likelion.momentreeblog.domain.board.board.entity.Board;
import com.likelion.momentreeblog.domain.s3.dto.response.PreSignedUrlResponseDto;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardPhotoResponseDto {
    private Long boardId;
    private PreSignedUrlResponseDto mainPhotoUrl;
    private List<PreSignedUrlResponseDto> additionalPhotoUrls;
    private String boardName;

}