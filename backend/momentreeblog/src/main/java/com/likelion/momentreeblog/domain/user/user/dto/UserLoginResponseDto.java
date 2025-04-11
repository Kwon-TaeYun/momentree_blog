package com.likelion.momentreeblog.domain.user.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder //중간에서 값을 가로채게 할 수 없게...
@NoArgsConstructor
@AllArgsConstructor
public class UserLoginResponseDto {
    private String accessToken;
    private String refreshToken;
    private String email;
    private String name;
}
