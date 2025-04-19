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

    public UserDto(User member) {
        this.id = member.getId();
        this.createDate = member.getCreatedAt();
        this.modifyDate = member.getUpdatedAt();
        this.email = member.getEmail();
        this.name = member.getName();
    }
}
