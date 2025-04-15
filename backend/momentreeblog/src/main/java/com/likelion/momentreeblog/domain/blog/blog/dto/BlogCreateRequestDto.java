package com.likelion.momentreeblog.domain.blog.blog.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 블로그 생성 시 요청에 사용되는 DTO
 */
@Getter
@Setter
public class BlogCreateRequestDto {
    // 블로그 이름 (필수)
    private String name;

    // 블로그 주인 유저의 ID (필수)
    private Long userId;
}