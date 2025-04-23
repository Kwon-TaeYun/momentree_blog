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

    @Override
    @Transactional(readOnly = true)
    public List<UserFollowDto> getFollowings(Long myUserId) {

        // 내 팔로잉 목록 가져오기
        List<FollowManagement> following =
                followRepository.findAllByFollowerId(myUserId);

        // 삭제 필터를 거쳐서 팔로윙 가져오기
        return following.stream()
                .map(FollowManagement::getFollowing)         // User 객체
                .filter(u -> u.getStatus() != UserStatus.DELETED)
                .map(u -> new UserFollowDto(
                        u.getId(),
                        u.getName(),
                        u.getStatus(),
                        u.getCurrentProfilePhoto()

                ))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserFollowDto> getFollowers(Long myUserId) {

        // 나를 팔로우 한 사람들의 목록 가져오기
        List<FollowManagement> followers =
                followRepository.findAllByFollowingId(myUserId);

        // 삭제 필터를 거쳐서 나를 팔로우한 사람들 가져오기
        return followers.stream()
                .map(FollowManagement::getFollower)
                .filter(u -> u.getStatus() != UserStatus.DELETED)
                .map(u -> new UserFollowDto(
                        u.getId(),
                        u.getName(),
                        u.getStatus(),
                        u.getCurrentProfilePhoto()
                ))
                .collect(Collectors.toList());
    }

}
