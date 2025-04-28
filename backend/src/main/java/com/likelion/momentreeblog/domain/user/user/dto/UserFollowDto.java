package com.likelion.momentreeblog.domain.user.user.dto;

import com.likelion.momentreeblog.domain.photo.photo.entity.Photo;
import com.likelion.momentreeblog.domain.user.user.userenum.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserFollowDto {
    private Long id;
    private String name;
    private UserStatus status;
    private String currentProfilePhotoUrl;
}
