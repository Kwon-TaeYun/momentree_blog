package com.likelion.momentreeblog.domain.user.user.controller;

import com.likelion.momentreeblog.domain.user.user.dto.UserLoginDto;
import com.likelion.momentreeblog.domain.user.user.dto.UserLoginResponseDto;
import com.likelion.momentreeblog.domain.user.user.dto.UserSignupDto;
import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.domain.user.user.service.UserService;
import com.likelion.momentreeblog.util.jwt.JwtTokenizer;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/v1/members")
public class UserApiV1Controller {
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenizer jwtTokenizer;
    //회원 가입
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody UserSignupDto userSignupDto){
        try{
            return ResponseEntity.ok(userService.saveUser(userSignupDto));
        }catch (Exception e){
            return ResponseEntity.internalServerError().body("서버 오류가 발생하였습니다.");
        }
    }

    //로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserLoginDto userLoginDto, HttpServletResponse response){
        //계정 인증
        User user = userService.findUserByEmail(userLoginDto.getEmail());
        if(user == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("존재하지 않는 이메일입니다. 다시 입력해주세요.");
        }

        if(!passwordEncoder.matches(userLoginDto.getPassword(), user.getPassword())){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("비밀번호가 같지 않습니다. 다시 입력해주세요.");
        }

        String role = user.getRole().getName();

        //토큰 굽기
        String accessToken = jwtTokenizer.createAccessToken(user.getId(), user.getEmail(),
                user.getName(), role);
        String refreshToken = jwtTokenizer.createAccessToken(user.getId(), user.getEmail(),
                user.getName(), role);

        user.setRefreshToken(refreshToken);
        userService.editUser(user);

        //쿠키에도 저장
        Cookie cookie = new Cookie("accessToken", accessToken);
        cookie.setHttpOnly(true); //보안 (자바스크립트에서는 접근 불가)
        cookie.setPath("/");
        cookie.setMaxAge(Math.toIntExact(JwtTokenizer.ACCESS_TOKEN_EXPIRE_COUNT)/1000); //쿠키 = s, jwt =  ms

        Cookie refreshCookie = new Cookie("refreshToken", refreshToken);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(Math.toIntExact(JwtTokenizer.ACCESS_TOKEN_EXPIRE_COUNT)/1000);
        response.addCookie(cookie);
        response.addCookie(refreshCookie);

        UserLoginResponseDto userLoginResponseDto = UserLoginResponseDto.builder()
                .accessToken("Bearer "+ accessToken)
                .refreshToken("Bearer "+ refreshToken)
                .email(user.getEmail())
                .name(user.getName())
                .build();

        return ResponseEntity.ok(userLoginResponseDto);
    }

    //로그아웃
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String acccessToken){
        try {
            Long userId = jwtTokenizer.getUserIdFromToken(acccessToken);
            User user = userService.findUserById(userId);
            user.setRefreshToken(null);
            userService.editUser(user);
            return ResponseEntity.ok("로그아웃 되었습니다 !!");
        }catch (Exception e){
            log.info(e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("유효하지 않은 토큰입니다.");
        }
    }









}
