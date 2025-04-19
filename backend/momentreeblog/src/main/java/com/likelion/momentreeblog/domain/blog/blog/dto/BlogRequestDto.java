package com.likelion.momentreeblog.domain.blog.blog.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BlogRequestDto {
    private Long userId;
    private String name;
}