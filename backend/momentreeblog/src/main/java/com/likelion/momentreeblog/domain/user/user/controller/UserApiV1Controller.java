package com.likelion.momentreeblog.domain.user.user.controller;

import com.likelion.momentreeblog.domain.user.role.entity.Role;
import com.likelion.momentreeblog.domain.user.user.dto.UserLoginDto;
import com.likelion.momentreeblog.domain.user.user.dto.UserLoginResponseDto;
import com.likelion.momentreeblog.domain.user.user.dto.UserSignupDto;
import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.domain.user.user.service.UserService;
import com.likelion.momentreeblog.global.util.jwt.JwtTokenizer;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

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
    public ResponseEntity<?> signup(@RequestBody UserSignupDto userSignupDto) {
        try {
            return ResponseEntity.ok(userService.saveUser(userSignupDto));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("서버 오류가 발생하였습니다.");
        }
    }

    //로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserLoginDto userLoginDto, HttpServletResponse response) {
        //계정 인증
        User user = userService.findUserByEmail(userLoginDto.getEmail());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("존재하지 않는 이메일입니다. 다시 입력해주세요.");
        }

        if (!passwordEncoder.matches(userLoginDto.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("비밀번호가 같지 않습니다. 다시 입력해주세요.");
        }

        List<String> roleNames = user.getRoles().stream()
                .map(Role::getName)  // Role 객체에서 name을 추출하여 String으로 변환
                .collect(Collectors.toList());

        //토큰 굽기
        String accessToken = jwtTokenizer.createAccessToken(user.getId(), user.getEmail(),
                user.getName(), roleNames);
        String refreshToken = jwtTokenizer.createRefreshToken(user.getId(), user.getEmail(),
                user.getName(), roleNames);

        user.setRefreshToken(refreshToken);
        userService.editUser(user);

        //쿠키에도 저장
        Cookie cookie = new Cookie("accessToken", accessToken);
        cookie.setHttpOnly(true); //보안 (자바스크립트에서는 접근 불가)
        cookie.setPath("/");
        cookie.setMaxAge(Math.toIntExact(JwtTokenizer.ACCESS_TOKEN_EXPIRE_COUNT) / 1000); //쿠키 = s, jwt =  ms

        Cookie refreshCookie = new Cookie("refreshToken", refreshToken);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(Math.toIntExact(JwtTokenizer.ACCESS_TOKEN_EXPIRE_COUNT) / 1000);
        response.addCookie(cookie);
        response.addCookie(refreshCookie);

        UserLoginResponseDto userLoginResponseDto = UserLoginResponseDto.builder()
                .accessToken("Bearer " + accessToken)
                .refreshToken("Bearer " + refreshToken)
                .email(user.getEmail())
                .name(user.getName())
                .build();

        return ResponseEntity.ok(userLoginResponseDto);
    }
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authorizationHeader,
                                    HttpServletResponse response) {
        try {
            // "Bearer {token}" → token만 추출
            String accessToken = authorizationHeader.replace("Bearer ", "").trim();

            Long userId = jwtTokenizer.getUserIdFromToken(accessToken);
            User user = userService.findUserById(userId);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("존재하지 않는 사용자입니다.");
            }

            user.setRefreshToken(null);
            userService.editUser(user);

            // 쿠키 삭제
            Cookie accessCookie = new Cookie("accessToken", null);
            accessCookie.setHttpOnly(true);
            accessCookie.setPath("/");
            accessCookie.setMaxAge(0);
            response.addCookie(accessCookie);

            Cookie refreshCookie = new Cookie("refreshToken", null);
            refreshCookie.setHttpOnly(true);
            refreshCookie.setPath("/");
            refreshCookie.setMaxAge(0);
            response.addCookie(refreshCookie);

            return ResponseEntity.ok("로그아웃 되었습니다 !!");

        } catch (Exception e) {
            log.info("로그아웃 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("유효하지 않은 토큰입니다.");
        }
    }

    //로그아웃
//    @PostMapping("/logout")
//    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authorizationHeader, HttpServletResponse response) {
//        {
//            String accessToken = authorizationHeader;
//            try {
//                Long userId = jwtTokenizer.getUserIdFromToken(accessToken);
//                User user = userService.findUserById(userId);
//                System.out.println(user);
//                user.setRefreshToken(null);
//                userService.editUser(user);
//
//                // 로그아웃 시 쿠키 삭제 추가
//                Cookie cookie = new Cookie("accessToken", null);
//                cookie.setHttpOnly(true);
//                cookie.setPath("/");
//                cookie.setMaxAge(0);
//                response.addCookie(cookie);
//
//                Cookie refreshCookie = new Cookie("refreshToken", null);
//                refreshCookie.setHttpOnly(true);
//                refreshCookie.setPath("/");
//                refreshCookie.setMaxAge(0);
//                response.addCookie(refreshCookie);
//
//                return ResponseEntity.ok("로그아웃 되었습니다 !!");
//            } catch (Exception e) {
//                log.info(e.getMessage());
//                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("유효하지 않은 토큰입니다.");
//            }
//        }
//    }
}










