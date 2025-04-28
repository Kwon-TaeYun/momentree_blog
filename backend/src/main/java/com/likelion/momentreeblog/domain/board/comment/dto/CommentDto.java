package com.likelion.momentreeblog.domain.board.comment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class CommentDto {
    private Long id;
    private Long userId;
    private String userName; //작성자 이름 추가
    private Long boardId;
    private String content;
    private String userProfileUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;


}
