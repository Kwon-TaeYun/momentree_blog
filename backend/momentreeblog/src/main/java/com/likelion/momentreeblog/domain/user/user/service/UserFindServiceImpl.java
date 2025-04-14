package com.likelion.momentreeblog.domain.user.user.service;

import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.domain.user.user.repository.FollowRepository;
import com.likelion.momentreeblog.domain.user.user.repository.UserFindRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class UserFindServiceImpl implements UserFindService{
    private final UserFindRepository userFindRepository;
    private final FollowRepository followRepository;

    @Override
    public User getUserById(Long id) {
        return userFindRepository.findById(id)
                .orElseThrow( () -> new NoSuchElementException("해당 아이디를 가진 유저를 찾을 수 없습니다."));
    }

    @Override
    public User getUserByEmail(String email) {
        return userFindRepository.findByEmail(email)
                .orElseThrow( () -> new NoSuchElementException("해당 이메일을 가진 유저를 찾을 수 없습니다."));
    }

    @Override
    public User getUserByName(String name) {
        return userFindRepository.findByName(name)
                .orElseThrow( () -> new NoSuchElementException("해당 이름을 가진 유저를 찾을 수 없습니다."));
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
