package com.likelion.momentreeblog.domain.board.board.dto;

import com.likelion.momentreeblog.domain.board.board.entity.Board;
import com.likelion.momentreeblog.domain.s3.dto.response.PreSignedUrlResponseDto;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
public class BoardMyBlogResponseDto {
    private Long id;
    private String title;
    private Long blogId;
    private Long likeCount;
    private List<PreSignedUrlResponseDto> currentMainPhotoUrls;  // ✅ 대표 이미지 URL 필드 추가
    private PreSignedUrlResponseDto currentProfilePhoto;
    private LocalDateTime createdAt;
    private Long commentCount;


    public static BoardMyBlogResponseDto from(Board board) {

        PreSignedUrlResponseDto currentProfilePhoto = new PreSignedUrlResponseDto();

        List<PreSignedUrlResponseDto> currentMainPhotoUrls = new ArrayList<>();


        return new BoardMyBlogResponseDto(
                board.getId(),
                board.getTitle(),
                board.getBlog().getId(),
                board.getLikes().stream().count(),
                currentMainPhotoUrls,
                currentProfilePhoto,
                board.getCreatedAt(),
                board.getComments().stream().count()
        );
    }

}
