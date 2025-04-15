package com.likelion.momentreeblog.domain.user.user.service;

import com.likelion.momentreeblog.domain.user.follower.entity.FollowManagement;
import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.domain.user.user.repository.FollowRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class FollowServiceImpl implements FollowService{
    private final FollowRepository followRepository;

    @Override
    @Transactional
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
    @Transactional
    public void unfollow(User follower, User following) {
        if (follower == null || following == null) {
            throw new IllegalArgumentException("팔로워나 팔로잉이 null입니다.");
        }

        Optional<FollowManagement> follow = followRepository.findByFollowerAndFollowing(follower, following);
        if (follow.isPresent()) {
            followRepository.delete(follow.get());
        } else {
            log.warn("팔로우 관계가 존재하지 않습니다: follower={}, following={}", follower.getId(), following.getId());
        }
    }

    @Override
    @Transactional
    public boolean isFollowing(User follower, User following) {
        return followRepository.findByFollowerAndFollowing(follower, following).isPresent();
    }
}
