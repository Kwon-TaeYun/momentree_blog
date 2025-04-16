package com.likelion.momentreeblog.domain.user.user.service;

import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.domain.user.user.repository.FollowRepository;
import com.likelion.momentreeblog.domain.user.user.repository.UserFindRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserFindServiceImpl implements UserFindService{
    private final UserFindRepository userFindRepository;
    private final FollowRepository followRepository;

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
    public Long getFollowingCount(User user) {
        return followRepository.countByFollowing(user);
    }

    @Override
    public Long getFollowerCount(User user) {
        return followRepository.countByFollower(user);
    }
}
