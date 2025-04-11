package com.likelion.momentreeblog.domain.blog.category.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryCreateRequestDto {
    private String name;
    private Long blogId;
}
