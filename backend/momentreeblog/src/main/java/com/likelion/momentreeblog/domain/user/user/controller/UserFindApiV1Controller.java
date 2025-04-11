package com.likelion.momentreeblog.domain.user.user.controller;

// 중복 검사, 유저 조회 전용

import com.likelion.momentreeblog.domain.user.user.dto.UserResponse;
import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.domain.user.user.service.UserFindService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
public class UserFindApiV1Controller {
    private final UserFindService userFindService;

    @GetMapping("/id")
    public ResponseEntity<UserResponse> getUserById(@RequestParam String id){
        User user = userFindService.getUserByEmail(id);
        return ResponseEntity.ok(UserResponse.from(user));
    }

    @GetMapping("/name")
    public ResponseEntity<UserResponse> getUserByName(@RequestParam String name){
        User user = userFindService.getUserByEmail(name);
        return ResponseEntity.ok(UserResponse.from(user));
    }

    @GetMapping("/email")
    public ResponseEntity<UserResponse> getUserByEmail(@RequestParam String email){
        User user = userFindService.getUserByEmail(email);
        return ResponseEntity.ok(UserResponse.from(user));
    }
}
