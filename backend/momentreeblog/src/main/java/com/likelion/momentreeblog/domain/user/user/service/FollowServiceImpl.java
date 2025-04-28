package com.likelion.momentreeblog.domain.user.user.service;

import com.likelion.momentreeblog.domain.user.follower.entity.FollowManagement;
import com.likelion.momentreeblog.domain.user.user.dto.UserFollowDto;
import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.domain.user.user.repository.FollowRepository;

import com.likelion.momentreeblog.domain.user.user.repository.UserRepository;

import com.likelion.momentreeblog.domain.user.user.userenum.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FollowServiceImpl implements FollowService {
    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void follow(User follower, User following) {

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

        // 단방향 관계만 삭제하도록 deleteByFollowerAndFollowing 사용
        followRepository.deleteByFollowerAndFollowing(follower, following);
        log.info("언팔로우 성공: follower={}, following={}", follower.getId(), following.getId());
    }

    @Override
    @Transactional
    public boolean isFollowing(User follower, User following) {
        return followRepository.findByFollowerAndFollowing(follower, following).isPresent();
    }

    @Override
    @Transactional
    public List<UserFollowDto> getFollowings(Long myUserId) {
        List<FollowManagement> followings = followRepository.findAllByFollowerId(myUserId);

        return followings.stream()
                .map(FollowManagement::getFollowing)
                .filter(user -> user.getStatus() != UserStatus.DELETED)
                .map(user -> new UserFollowDto(
                        user.getId(),
                        user.getName(),
                        user.getStatus(),
                        user.getCurrentProfilePhoto() != null ? user.getCurrentProfilePhoto().getUrl() : null
                ))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<UserFollowDto> getFollowers(Long myUserId) {
        List<FollowManagement> followers = followRepository.findAllByFollowingId(myUserId);

        return followers.stream()
                .map(FollowManagement::getFollower)
                .filter(user -> user.getStatus() != UserStatus.DELETED)
                .map(user -> new UserFollowDto(
                        user.getId(),
                        user.getName(),
                        user.getStatus(),
                        user.getCurrentProfilePhoto() != null ? user.getCurrentProfilePhoto().getUrl() : null
                ))
                .collect(Collectors.toList());
    }

    public boolean isAlreadyFollowing(User follower, User following) {
        return followRepository.existsByFollowerAndFollowing(follower, following);
    }

}
