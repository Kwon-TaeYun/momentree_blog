package com.likelion.momentreeblog.domain.board.like.dto;
import com.likelion.momentreeblog.domain.board.like.entity.Like;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class LikeResponseDto {
    private Long id;
    private Long userId;

    public static LikeResponseDto from(Like like) {
        return LikeResponseDto.builder()
                .id(like.getId())
                .userId(like.getUser().getId())
                .build();
    }
}
