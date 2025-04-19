package com.likelion.momentreeblog.domain.user.user.controller;

// 팔로우/언팔로우/팔로우 수 확인

import com.likelion.momentreeblog.domain.user.user.dto.UserFollowDto;
import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.domain.user.user.service.FollowService;
import com.likelion.momentreeblog.domain.user.user.service.UserFindService;
import com.likelion.momentreeblog.global.util.jwt.JwtTokenizer;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Tag(name = "Follow", description = "팔로우 관련 API")
@RestController
@RequestMapping("/api/v1/follows")
@RequiredArgsConstructor
public class FollowApiV1Controller {
    private final UserFindService userFindService;
    private final FollowService followService;
    private final JwtTokenizer jwtTokenizer;

    // 특정 유저 팔로워 수 조회
    @Operation(summary = "팔로잉 수 조회", description = "특정 유저의 팔로워 수를 조회합니다.")
    @GetMapping("/members/{id}/followings/counts")
    public ResponseEntity<?> getFollowerCount(@PathVariable(name="id") Long id){
        Optional<User> user = userFindService.getUserById(id);
        if(user.isEmpty()) {
            return ResponseEntity.ok("유저를 찾을 수 없습니다.");
        }else {
            long count = userFindService.getFollowerCount(user.get());
            return ResponseEntity.ok(count);
        }
    }

    // 특정 유저의 팔로잉 수 조회
    @Operation(summary = "팔로워 수 조회", description = "특정 유저의 팔로잉 수를 조회합니다.")
    @GetMapping("/members/{id}/followers/counts")
    public ResponseEntity<?> getFollowingCount(@PathVariable(name="id") Long id){
        Optional<User> user = userFindService.getUserById(id);
        if(user.isEmpty()) {
            return ResponseEntity.ok("유저를 찾을 수 없습니다.");
        }else {
            long count = userFindService.getFollowingCount(user.get());
            return ResponseEntity.ok(count);
        }
    }

    @Operation(summary = "팔로우 요청", description = "다른 사용자를 팔로우합니다.")
    @PostMapping("/follow")
    public ResponseEntity<String> follow(
            @RequestParam(name = "followingid") Long followingId,
            @RequestHeader("Authorization") String authorizationHeader) {
        Long userId = jwtTokenizer.getUserIdFromToken(authorizationHeader);

        // ✅ 자기 자신 체크를 제일 먼저!
        if (userId.equals(followingId)) {
            return ResponseEntity.status(401).body("자신을 팔로우할 수 없습니다.");
        }

        Optional<User> follower = userFindService.getUserById(userId);
        Optional<User> following = userFindService.getUserById(followingId);

        try {
            if (follower.isEmpty()) {
                return ResponseEntity.status(401).body("회원이 인증이 되지 않아 팔로우 요청을 보낼 수 없습니다.");
            }

            if (following.isEmpty()) {
                return ResponseEntity.status(404).body("팔로우 할 회원을 찾을 수 없습니다.");
            }

            followService.follow(follower.get(), following.get());
            return ResponseEntity.ok("팔로우 성공");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body("이미 팔로우 중인 유저입니다.");
        }
    }


    @Operation(summary = "팔로우 취소 (언팔로우)", description = "팔로우를 취소합니다.")
    @DeleteMapping("/unfollow")
    public ResponseEntity<String> unfollow(
            @RequestParam(name = "followingid") Long followingId,
            @RequestHeader("Authorization") String authorizationHeader) {

        Long userId = jwtTokenizer.getUserIdFromToken(authorizationHeader);

        // ✅ 자기 자신 체크
        if (userId.equals(followingId)) {
            return ResponseEntity.status(401).body("자신을 언팔로우할 수 없습니다.");
        }

        Optional<User> follower = userFindService.getUserById(userId);
        Optional<User> following = userFindService.getUserById(followingId);

        if (follower.isEmpty()) {
            return ResponseEntity.status(401).body("회원이 인증이 되지 않아 언팔로우 요청을 보낼 수 없습니다.");
        }

        if (following.isEmpty()) {
            return ResponseEntity.status(404).body("언팔로우 할 회원을 찾을 수 없습니다.");
        }

        try {
            followService.unfollow(follower.get(), following.get());
            return ResponseEntity.ok("언팔로우 성공");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body("언팔로우 도중 문제가 발생했습니다: " + e.getMessage());
        }
    }

    @Operation(summary = "팔로우 여부 확인", description = "특정 유저가 팔로우 중인지 확인합니다.")
    @GetMapping("/check")
    public ResponseEntity<Boolean> isFollowing(
            @RequestParam(name="followerid") Long followerId,
            @RequestParam(name = "followingid") Long followingId) {
        User follower = userFindService.getUserById(followerId).get();
        User following = userFindService.getUserById(followingId).get();
        boolean result = followService.isFollowing(follower, following);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/members/{id}/followers")
    public ResponseEntity<List<UserFollowDto>> listFollowers(@PathVariable Long userId) {
        List<UserFollowDto> list = followService.getFollowers(userId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/members/{id}/followings")
    public ResponseEntity<List<UserFollowDto>> listFollowings(@PathVariable Long userId) {
        List<UserFollowDto> list = followService.getFollowings(userId);
        return ResponseEntity.ok(list);
    }

}
