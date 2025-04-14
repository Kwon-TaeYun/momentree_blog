package com.likelion.momentreeblog.domain.user.user.service;

import com.likelion.momentreeblog.domain.user.follower.entity.FollowManagement;
import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.domain.user.user.repository.FollowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FollowServiceImpl implements FollowService{
    private final FollowRepository followRepository;

    @Override
    public void follow(User follower, User following) {
        if(isFollowing(follower, following)){
            throw new IllegalArgumentException("이미 팔로우 중인 유저입니다.");
        }

        FollowManagement follow = FollowManagement.builder()
                .follower(follower)
                .following(following)
                .build();

        followRepository.save(follow);
    }

    @Override
    public void unfollow(User follower, User following) {
        followRepository.deleteByFollowerAndFollowing(follower, following);
    }

    @Override
    public boolean isFollowing(User follower, User following) {
        return followRepository.findByFollowerAndFollowing(follower, following).isPresent();
    }
}
