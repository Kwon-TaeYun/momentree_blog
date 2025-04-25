package com.likelion.momentreeblog.domain.user.user.dto;

import com.likelion.momentreeblog.domain.user.user.entity.User;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class UserDto {
    @NotNull
    private final Long id;

    @NotNull
    private final LocalDateTime createDate;

    @NotNull
    private final LocalDateTime modifyDate;

    @NotNull
    private final String email;

    @NotNull
    private final String name;

    private final String blogName;
    private final Long viewCount;
    private final Long blogId;

    private String profilePhotoUrl;

    public UserDto(User member,String profilePhotoUrl) {
        this.id = member.getId();
        this.createDate = member.getCreatedAt();
        this.modifyDate = member.getUpdatedAt();
        this.email = member.getEmail();
        this.name = member.getName();
        this.blogName = member.getBlog().getName();
        this.blogId = member.getBlog().getId();
        this.viewCount = member.getBlog().getViewCount();
        this.profilePhotoUrl = profilePhotoUrl;
    }
}
