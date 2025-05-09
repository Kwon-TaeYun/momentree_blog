package com.likelion.momentreeblog.domain.user.user.service;

import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.domain.user.user.repository.FollowRepository;
import com.likelion.momentreeblog.domain.user.user.repository.UserFindRepository;
import com.likelion.momentreeblog.domain.user.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserFindServiceImpl implements UserFindService{
    private final UserFindRepository userFindRepository;
    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    @Override
    public Optional<User> getUserById(Long id) {
        return userFindRepository.findById(id);
    }

    @Override
    public Optional<User> getUserByEmail(String email) {
        return userFindRepository.findByEmail(email);
    }

    @Override
    public Optional<User> getUserByName(String name) {
        return userFindRepository.findByName(name);
    }

    @Override
    public Optional<User> getUserByNameAndEmail(String name, String email) {
        return userRepository.findByNameAndEmail(name, email);
    }

    @Override
    public Long getFollowingCount(User user) {
        // 팔로잉 수 (내가 팔로우하는 사람 수)를 가져오려면 followRepository.countByFollower를 호출해야 함
        return followRepository.countByFollower(user);
    }

    @Override
    public Long getFollowerCount(User user) {
        // 팔로워 수 (나를 팔로우하는 사람 수)를 가져오려면 followRepository.countByFollowing를 호출해야 함
        return followRepository.countByFollowing(user);
    }

    // @Override
    // public Long getFollowingCount(User user) {
    //     return followRepository.countByFollowing(user);
    // }

    // @Override
    // public Long getFollowerCount(User user) {
    //     return followRepository.countByFollower(user);
    // }

}
