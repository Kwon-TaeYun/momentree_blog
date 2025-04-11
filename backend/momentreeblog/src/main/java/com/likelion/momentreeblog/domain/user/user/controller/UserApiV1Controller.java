package com.likelion.momentreeblog.domain.user.user.controller;

import com.likelion.momentreeblog.domain.user.user.dto.UserSignupDto;
import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.domain.user.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/members")
public class UserApiV1Controller {
    private final UserService userService;
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody UserSignupDto userSignupDto){
        try{
            return ResponseEntity.ok(userService.saveUser(userSignupDto));
        }catch (Exception e){
            return ResponseEntity.internalServerError().body("서버 오류가 발생하였습니다.");
        }
    }




}
