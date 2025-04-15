package com.likelion.momentreeblog.domain.user.user.controller;

// 팔로우/언팔로우/팔로우 수 확인

import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.domain.user.user.service.FollowService;
import com.likelion.momentreeblog.domain.user.user.service.UserFindService;
import com.likelion.momentreeblog.global.util.jwt.JwtTokenizer;
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
//    private final UserFindService userFindService;
//    private final FollowService followService;
//    private final JwtTokenizer jwtTokenizer;
//
//    // 특정 유저 팔로워 수 조회
//    @Operation(summary = "팔로우 수 조회", description = "특정 유저의 팔로워 수를 조회합니다.")
//    @GetMapping("/members/{id}/followers")
//    public ResponseEntity<Long> getFollowerCount(@PathVariable(name="id") Long id){
//        User user = userFindService.getUserById(id);
//        long count = userFindService.getFollowerCount(user);
//        return ResponseEntity.ok(count);
//    }
//
//    // 특정 유저의 팔로잉 수 조회
//    @Operation(summary = "팔로잉 수 조회", description = "특정 유저의 팔로잉 수를 조회합니다.")
//    @GetMapping("/members/{id}/followings")
//    public ResponseEntity<Long> getFollowingCount(@PathVariable(name="id") Long id){
//        User user = userFindService.getUserById(id);
//        long count = userFindService.getFollowingCount(user);
//        return ResponseEntity.ok(count);
//    }
//
//    @Operation(summary = "팔로우 요청", description = "다른 사용자를 팔로우합니다.")
//    @PostMapping("/follow")
//    public ResponseEntity<String> follow(
//            @RequestParam(name="followerid") Long followerId,
//            @RequestParam(name = "followingid") Long followingId,
//            @RequestHeader("Authorization") String authorizationHeader) {
//        Long userId = jwtTokenizer.getUserIdFromToken(authorizationHeader);
//        User follower = userFindService.getUserById(followerId);
//        User following = userFindService.getUserById(followingId);
//        if(userId.equals(followerId)) {
//            followService.follow(follower, following);
//            return ResponseEntity.ok("팔로우 성공");
//        }else{
//            return ResponseEntity.status(401).body("회원이 인증이 되지 않아 팔로우 요청을 보낼 수 없습니다.");
//        }
//    }
//
//    @Operation(summary = "팔로우 취소 (언팔로우)", description = "팔로우를 취소합니다.")
//    @DeleteMapping("/unfollow")
//    public ResponseEntity<String> unfollow(
//            @RequestParam(name="followerid") Long followerId,
//            @RequestParam(name = "followingid") Long followingId,
//            @RequestHeader("Authorization") String authorizationHeader) {
//        Long userId = jwtTokenizer.getUserIdFromToken(authorizationHeader);
//        User follower = userFindService.getUserById(followerId);
//        User following = userFindService.getUserById(followingId);
//        if(userId.equals(followerId)) {
//            followService.unfollow(follower, following);
//            return ResponseEntity.ok("언팔로우 성공");
//        }else{
//            return ResponseEntity.status(401).body("회원이 인증이 되지 않아 팔로우 취소를 하실 수 없습니다.");
//        }
//    }
//
//    @Operation(summary = "팔로우 여부 확인", description = "특정 유저가 팔로우 중인지 확인합니다.")
//    @GetMapping("/check")
//    public ResponseEntity<Boolean> isFollowing(
//            @RequestParam(name="followerid") Long followerId,
//            @RequestParam(name = "followingid") Long followingId) {
//        User follower = userFindService.getUserById(followerId);
//        User following = userFindService.getUserById(followingId);
//        boolean result = followService.isFollowing(follower, following);
//        return ResponseEntity.ok(result);
//    }
}
