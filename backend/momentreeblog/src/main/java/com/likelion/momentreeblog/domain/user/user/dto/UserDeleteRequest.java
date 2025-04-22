package com.likelion.momentreeblog.domain.user.user.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class UserDeleteRequest {
    String email;
    String password;
}
