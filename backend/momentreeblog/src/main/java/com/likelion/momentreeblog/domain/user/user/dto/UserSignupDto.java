package com.likelion.momentreeblog.domain.user.user.dto;

import com.likelion.momentreeblog.domain.blog.blog.entity.Blog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter @Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSignupDto {
    private String name;
    private String email;
    private String password;
    private String blogName;
    private String refreshToken;
}
