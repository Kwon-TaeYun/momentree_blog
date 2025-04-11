package com.likelion.momentreeblog.domain.user.user.controller;

// 팔로우/언팔로우/팔로우 수 확인

import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.domain.user.user.service.FollowService;
import com.likelion.momentreeblog.domain.user.user.service.UserFindService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Follow", description = "팔로우 관련 API")
@RestController
@RequestMapping("/api/v1/follows")
@RequiredArgsConstructor
public class FollowApiV1Controller {
    private final UserFindService userFindService;
    private final FollowService followService;

    // 특정 유저 팔로워 수 조회
    @Operation(summary = "팔로우 수 조회", description = "특정 유저의 팔로워 수를 조회합니다.")
    @GetMapping("/members/{id}/followers")
    public ResponseEntity<Long> getFollowerCount(@PathVariable Long id){
        User user = userFindService.getUserById(id);
        long count = userFindService.getFollowerCount(user);
        return ResponseEntity.ok(count);
    }

    // 특정 유저의 팔로잉 수 조회
    @Operation(summary = "팔로잉 수 조회", description = "특정 유저의 팔로잉 수를 조회합니다.")
    @GetMapping("/members/{id}/followings")
    public ResponseEntity<Long> getFollowingCount(@PathVariable Long id){
        User user = userFindService.getUserById(id);
        long count = userFindService.getFollowingCount(user);
        return ResponseEntity.ok(count);
    }

    @Operation(summary = "팔로우 요청", description = "다른 사용자를 팔로우합니다.")
    @PostMapping("/follow")
    public ResponseEntity<String> follow(
            @RequestParam Long followerId,
            @RequestParam Long followingId) {
        User follower = userFindService.getUserById(followerId);
        User following = userFindService.getUserById(followingId);
        followService.follow(follower, following);
        return ResponseEntity.ok("팔로우 성공");
    }
}
