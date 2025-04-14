package com.likelion.momentreeblog.domain.blog.blog.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * 블로그 조회 응답에 사용되는 DTO
 */
@Getter
@Builder
public class BlogResponseDto {
    // 블로그 ID
    private Long id;

    // 블로그 이름
    private String name;

    // 조회수
    private Long viewCount;
}