package com.likelion.momentreeblog.domain.blog.blog.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 블로그 수정 요청에 사용되는 DTO
 */
@Getter
@Setter
public class BlogUpdateRequestDto {
    // 새 블로그 이름
    private String name;
}