package com.likelion.momentreeblog.domain.user.user.service;

import com.likelion.momentreeblog.domain.user.user.entity.User;

// 팔로우/언팔로우, 팔로우 수 확인
public interface FollowService {
    void follow(User follower, User following);
    void unfollow(User follower, User following);
    boolean isFollowing(User follower, User following);
}
