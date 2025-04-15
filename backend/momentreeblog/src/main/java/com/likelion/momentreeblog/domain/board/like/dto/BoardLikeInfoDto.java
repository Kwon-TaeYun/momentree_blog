package com.likelion.momentreeblog.domain.board.like.dto;

import com.likelion.momentreeblog.domain.user.user.dto.UserLikeDto;
import com.likelion.momentreeblog.domain.user.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class BoardLikeInfoDto {
    private List<UserLikeDto> users;
    private int likeCount;


}
