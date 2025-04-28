package com.likelion.momentreeblog.domain.board.board.dto;

import com.likelion.momentreeblog.domain.board.board.entity.Board;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BoardResponseDto {
    private Long id;
    private String title;
    private String content;
    private String photoSavedUrl;
    private String blogName;
    private String categoryName;

    private Long authorId;       // 추가
    private String authorName;   // 추가

    public static BoardResponseDto from(Board board) {
        return new BoardResponseDto(
                board.getId(),
                board.getTitle(),
                board.getContent(),
                board.getCurrentMainPhoto().getUrl(),               // photoSavedUrl
                board.getBlog().getName(),
                board.getCategory().getName(),
                board.getBlog().getUser().getId(),
                board.getBlog().getUser().getName()
        );
    }

}

