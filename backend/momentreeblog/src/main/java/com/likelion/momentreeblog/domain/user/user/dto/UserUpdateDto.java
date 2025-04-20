package com.likelion.momentreeblog.domain.user.user.dto;

import com.likelion.momentreeblog.domain.photo.photo.entity.Photo;
import lombok.Getter;

@Getter
public class UserUpdateDto {
    private Long id;
    private String name;
    private String email;
    private String password;
    private String blogName;
    private Photo currentProfilePhoto;

}
