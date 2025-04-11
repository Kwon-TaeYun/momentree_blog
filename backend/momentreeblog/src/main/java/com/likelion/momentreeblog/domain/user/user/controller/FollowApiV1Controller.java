package com.likelion.momentreeblog.domain.user.user.controller;

// 팔로우/언팔로우/팔로우 수 확인

import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.domain.user.user.service.UserFindService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/follow")
@RequiredArgsConstructor
public class FollowApiV1Controller {
    private final UserFindService userFindService;

    // 특정 유저 팔로워 수 조회
    @GetMapping("/members/{id}/followers")
    public ResponseEntity<Long> getFollowerCount(@PathVariable Long id){
        User user = userFindService.getUserById(id);
        long count = userFindService.getFollowerCount(user);
        return ResponseEntity.ok(count);
    }
}
