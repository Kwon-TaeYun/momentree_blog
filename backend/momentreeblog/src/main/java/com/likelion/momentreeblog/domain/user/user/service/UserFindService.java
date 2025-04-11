package com.likelion.momentreeblog.domain.user.user.service;

import com.likelion.momentreeblog.domain.user.user.entity.User;

// 이메일/닉네임 중복 체크, 아이디 찾기 (정의)
public interface UserFindService {
    User getUserById(Long id);
    User getUserByEmail(String email);
    User getUserByName(String name);

    Long getFollowingCount(User user);
    Long getFollowerCount(User user);
}
