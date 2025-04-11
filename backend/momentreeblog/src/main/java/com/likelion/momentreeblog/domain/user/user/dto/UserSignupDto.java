package com.likelion.momentreeblog.domain.user.user.dto;

import com.likelion.momentreeblog.domain.blog.blog.entity.Blog;
import jakarta.validation.constraints.Pattern;
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
    @Pattern(
            regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]{10,}$|^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?])[A-Za-z\\d!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]{8,}$",
            message = "비밀번호는 영문, 숫자, 특수문자 중 2종류 이상 포함 10자 이상 또는 3종류 이상 포함 8자 이상이어야 합니다."
    )
    private String password;
    private String blogName;
    private String refreshToken;
}
