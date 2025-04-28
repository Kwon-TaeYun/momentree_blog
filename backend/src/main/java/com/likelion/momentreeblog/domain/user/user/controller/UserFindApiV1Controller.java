package com.likelion.momentreeblog.domain.user.user.controller;

// 중복 검사, 유저 조회 전용

import com.likelion.momentreeblog.domain.user.user.dto.UserResponse;
import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.domain.user.user.service.UserFindService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
public class UserFindApiV1Controller {
    private final UserFindService userFindService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable(name = "id") Long id){
        Optional<User> user = userFindService.getUserById(id);
        if(user.isEmpty()){
            return ResponseEntity.ok("해당 아이디를 가진 유저를 찾을 수 없습니다.");
        }else {
            return ResponseEntity.ok(UserResponse.from(user.get()));
        }
    }

    @GetMapping("/name")
    public ResponseEntity<?> getUserByName(@RequestParam(name = "name") String name){
        Optional<User> user = userFindService.getUserByName(name);
        if(user.isEmpty()){
            return ResponseEntity.ok("해당 이름을 가진 유저를 찾을 수 없습니다.");
        }else {
            return ResponseEntity.ok(UserResponse.from(user.get()));
        }
    }

    @GetMapping("/email")
    public ResponseEntity<?> getUserByEmail(@RequestParam(name = "email") String email){
        Optional<User> user = userFindService.getUserByEmail(email);
        if(user.isEmpty()){
            return ResponseEntity.ok("해당 이메일을 가진 유저를 찾을 수 없습니다.");
        }else {
            return ResponseEntity.ok(UserResponse.from(user.get()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> getUserByNameAndEmail(
            @RequestParam(name = "name") String name,
            @RequestParam(name = "email") String email) {
        Optional<User> user = userFindService.getUserByNameAndEmail(name, email);
        if(user.isEmpty()) {
            return ResponseEntity.ok("해당하는 유저를 찾을 수 없습니다.");
        } else {
            return ResponseEntity.ok(UserResponse.from(user.get()));
        }
    }
}

