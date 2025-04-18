package com.likelion.momentreeblog.domain.blog.blog.dto;

import lombok.*;

/**
 * 블로그 조회 응답에 사용되는 DTO
 */
@Getter
@Builder
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BlogResponseDto {
    // 블로그 ID
    private Long id;

    // 블로그 이름
    private String name;

    // 조회수
    private Long viewCount;
}