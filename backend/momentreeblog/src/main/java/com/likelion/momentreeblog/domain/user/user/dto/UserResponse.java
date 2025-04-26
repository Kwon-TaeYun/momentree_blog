package com.likelion.momentreeblog.domain.user.user.dto;

import com.likelion.momentreeblog.domain.user.user.entity.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserResponse {
    private Long id; // 아이디
    private String name; // 이름
    private String email; // 이메일
    private Long blogViewCount;
    private String blogName;
    private String profilePhotoUrl;
    private String profilePhotoKey;
    private Long blogId;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .blogViewCount(user.getBlog().getViewCount())
                .blogName(user.getBlog().getName())
                .blogId(user.getBlog().getId())
                .build();
    }
}