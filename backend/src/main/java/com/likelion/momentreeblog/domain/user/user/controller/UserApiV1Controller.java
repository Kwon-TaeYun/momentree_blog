package com.likelion.momentreeblog.domain.user.user.controller;

import com.likelion.momentreeblog.config.security.dto.CustomUserDetails;
import com.likelion.momentreeblog.domain.photo.photo.entity.Photo;
import com.likelion.momentreeblog.domain.s3.service.S3V1Service;
import com.likelion.momentreeblog.domain.user.role.entity.Role;
import com.likelion.momentreeblog.domain.user.user.dto.*;
import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.domain.user.user.service.UserService;
import com.likelion.momentreeblog.domain.user.user.userenum.UserStatus;
import com.likelion.momentreeblog.global.rq.Rq;
import com.likelion.momentreeblog.global.util.jwt.JwtTokenizer;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/v1/members")
public class UserApiV1Controller {
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenizer jwtTokenizer;
    private final Rq rq;
    private final S3V1Service s3V1Service;

    @Value("${custom.default-image.url}")
    private String DEFAULT_IMAGE_URL;

    @PostMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        log.info("이메일 중복 확인 요청: {}", email);

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "이메일을 입력해주세요."));
        }

        User user = userService.findUserByEmail(email);

        if (user != null) {
            return ResponseEntity.ok(Map.of("available", false, "message", "이미 사용 중인 이메일입니다."));
        }

        return ResponseEntity.ok(Map.of("available", true, "message", "사용 가능한 이메일입니다."));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody UserSignupDto userSignupDto) {
        try {
            log.info("회원가입 요청 - email: {}, name: {}", userSignupDto.getEmail(), userSignupDto.getName());

            if (userSignupDto.getEmail() == null || userSignupDto.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "이메일을 입력해주세요."));
            }
            if (userSignupDto.getName() == null || userSignupDto.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "이름을 입력해주세요."));
            }
            if (userSignupDto.getPassword() == null || userSignupDto.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "비밀번호를 입력해주세요."));
            }
            if (userSignupDto.getBlogName() == null || userSignupDto.getBlogName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "블로그 이름을 입력해주세요."));
            }

            String result = userService.saveUser(userSignupDto);

            if (result.contains("이미 존재하는") || result.contains("형식이 올바르지") || result.contains("최소 8자리")) {
                return ResponseEntity.badRequest().body(Map.of("message", result));
            }

            return ResponseEntity.ok(Map.of("message", result));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "서버 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserLoginDto userLoginDto, HttpServletResponse response) {
        User user = userService.findUserByEmail(userLoginDto.getEmail());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "존재하지 않는 이메일입니다. 다시 입력해주세요."));
        }
        if (!passwordEncoder.matches(userLoginDto.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "비밀번호가 같지 않습니다. 다시 입력해주세요."));
        }
        if (user.getStatus().equals(UserStatus.DELETED)) {
            return ResponseEntity.badRequest().body(Map.of("message", "탈퇴한 회원이므로 로그인하실 수 없습니다."));
        }

        List<String> roleNames = user.getRoles().stream().map(Role::getName).collect(Collectors.toList());
        String accessToken = jwtTokenizer.createAccessToken(user.getId(), user.getEmail(), user.getName(), roleNames);
        String refreshToken = jwtTokenizer.createRefreshToken(user.getId(), user.getEmail(), user.getName(), roleNames);

        user.setRefreshToken(refreshToken);
        userService.editUser(user);

        Cookie cookie = new Cookie("accessToken", accessToken);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(Math.toIntExact(JwtTokenizer.ACCESS_TOKEN_EXPIRE_COUNT) / 1000);

        Cookie refreshCookie = new Cookie("refreshToken", refreshToken);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(Math.toIntExact(JwtTokenizer.ACCESS_TOKEN_EXPIRE_COUNT) / 1000);

        response.addCookie(cookie);
        response.addCookie(refreshCookie);

        return ResponseEntity.ok(Map.of(
                "accessToken", accessToken,
                "refreshToken", refreshToken,
                "email", user.getEmail(),
                "name", user.getName()
        ));
    }

    @PutMapping("/edit")
    public ResponseEntity<?> editUser(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                      @RequestBody UserUpdateDto updateDto) {
        Long tokenUserId = customUserDetails.getUserId();
        User user = userService.findUserById(tokenUserId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "해당 사용자를 찾을 수 없습니다."));
        }

        if (updateDto.getName() != null) user.setName(updateDto.getName());
        if (updateDto.getEmail() != null) user.setEmail(updateDto.getEmail());
        if (updateDto.getPassword() != null) user.setPassword(passwordEncoder.encode(updateDto.getPassword()));
        if (updateDto.getBlogName() != null) user.getBlog().setName(updateDto.getBlogName());
        if (updateDto.getCurrentProfilePhoto() != null) user.setCurrentProfilePhoto(updateDto.getCurrentProfilePhoto());

        userService.editUser(user);
        return ResponseEntity.ok(Map.of("message", "회원정보가 수정되었습니다."));
    }

    @DeleteMapping("/logout")
    public void logout() {
        rq.deleteCookie("accessToken");
        rq.deleteCookie("refreshToken");
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        try {
            String accessToken = rq.getCookieValue("accessToken");
            if (accessToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "인증 정보가 없습니다."));
            }

            Map<String, Object> claims = jwtTokenizer.parseAccessToken(accessToken);
            if (claims == null || !claims.containsKey("userId")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "유효하지 않은 인증 정보입니다."));
            }

            Long userId = Long.parseLong(claims.get("userId").toString());
            User user = userService.findUserById(userId);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "사용자 정보를 찾을 수 없습니다."));
            }

            String key = Optional.ofNullable(user.getCurrentProfilePhoto())
                    .map(Photo::getUrl)
                    .orElse(DEFAULT_IMAGE_URL);

            String url = s3V1Service.generateGetPresignedUrl(key).getUrl();
            return ResponseEntity.ok(new UserDto(user, url));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "사용자 정보 조회 중 오류가 발생했습니다."));
        }
    }

    @PostMapping("/delete")
    public ResponseEntity<?> changeStatusDeleted(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                                 @RequestBody UserDeleteRequest request) {
        Long userId = customUserDetails.getUserId();
        userService.changeUserStatusDeleted(userId, request);
        return ResponseEntity.ok(Map.of("message", "회원 탈퇴를 성공하셨습니다"));
    }

    @GetMapping("/top5")
    public ResponseEntity<?> getTop5Users() {
        List<UserResponse> top5Users = userService.getTop5Bloggers();
        return ResponseEntity.ok(Map.of("top5Users", top5Users));
    }
}
