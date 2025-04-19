package com.likelion.momentreeblog.domain.user.user.service;

import com.likelion.momentreeblog.domain.user.user.dto.UserFollowDto;
import com.likelion.momentreeblog.domain.user.user.entity.User;

import java.util.List;

// 팔로우/언팔로우, 팔로우 수 확인
public interface FollowService {
    void follow(User follower, User following);
    void unfollow(User follower, User following);
    boolean isFollowing(User follower, User following);

    // 내 팔로잉 목록 - 내가 follow 한 사람들의 목록
    List<UserFollowDto> getFollowings(Long myUserId);

    // 내 팔로워 목록 - 나를 follow 한 사람들의 목록
    List<UserFollowDto> getFollowers(Long myUserId);

}
