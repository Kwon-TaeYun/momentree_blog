package com.likelion.momentreeblog.domain.board.board.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BoardListResponseDto {
    private Long id;
    private String title;
    private Long blogId;

}
