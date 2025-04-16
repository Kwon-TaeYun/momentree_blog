package com.likelion.momentreeblog.domain.user.user.service;

import com.likelion.momentreeblog.domain.user.user.entity.User;

import java.util.Optional;

// 이메일/닉네임 중복 체크, 아이디 찾기 (정의)
public interface UserFindService {
    Optional<User> getUserById(Long id);
    Optional<User> getUserByEmail(String email);
    Optional<User> getUserByName(String name);

    Long getFollowingCount(User user);
    Long getFollowerCount(User user);
}
