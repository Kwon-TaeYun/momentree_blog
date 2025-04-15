package com.likelion.momentreeblog.domain.board.board.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BoardResponseDto {
    private Long id;
    private String title;
    private String content;
    private String photoSavedUrl;
    private String blogName;
    private String categoryName;

}
