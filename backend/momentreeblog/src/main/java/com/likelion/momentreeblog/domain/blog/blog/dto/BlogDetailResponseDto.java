package com.likelion.momentreeblog.domain.blog.blog.dto;

import com.likelion.momentreeblog.domain.board.board.dto.BoardListResponseDto;
import lombok.*;
import org.springframework.data.domain.Page;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlogDetailResponseDto {
    private Long id;
    private String name;
    private String userName;
    private String userEmail;
    private String profileImage;
    private Long postsCount;
    private Page<BoardListResponseDto> boards;

    // 팔로우 관련 정보는 프론트엔드에서 별도로 조회
}
