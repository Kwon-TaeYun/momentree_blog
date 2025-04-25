package com.likelion.momentreeblog.domain.board.board.dto;

import com.likelion.momentreeblog.domain.board.board.entity.Board;
import lombok.AllArgsConstructor;
import lombok.Data;


@Data
@AllArgsConstructor
public class BoardListResponseDto {
    private Long id;
    private String title;
    private Long blogId;
    private String imageUrl;  // ✅ 대표 이미지 URL 필드 추가
    private Long likeCount;
    public static BoardListResponseDto from(Board board) {
        String imageUrl = board.getCurrentMainPhoto() != null
                ? board.getCurrentMainPhoto().getUrl()
                : null;

        return new BoardListResponseDto(
                board.getId(),
                board.getTitle(),
                board.getBlog().getId(),
                imageUrl,
                board.getLikes().stream().count()
        );
    }
}