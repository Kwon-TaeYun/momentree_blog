package com.likelion.momentreeblog.domain.user.user.dto;

import lombok.Getter;

@Getter
public class UserDeleteRequest {
    String email;
    String password;
}
