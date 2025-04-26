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


    // 이메일 중복 확인 API 추가
    @PostMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        log.info("이메일 중복 확인 요청: {}", email);
        
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("이메일을 입력해주세요.");
        }
        
        User user = userService.findUserByEmail(email);
        
        if (user != null) {
            return ResponseEntity.ok(Map.of("available", false, "message", "이미 사용 중인 이메일입니다."));
        }
        
        return ResponseEntity.ok(Map.of("available", true, "message", "사용 가능한 이메일입니다."));
    }

    //회원 가입
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody UserSignupDto userSignupDto) {
        try {
            log.info("회원가입 요청 - email: {}, name: {}", userSignupDto.getEmail(), userSignupDto.getName());
            
            // 입력값 검증
            if (userSignupDto.getEmail() == null || userSignupDto.getEmail().trim().isEmpty()) {
                log.warn("회원가입 실패 - 이메일 누락");
                return ResponseEntity.badRequest().body("이메일을 입력해주세요.");
            }
            
            if (userSignupDto.getName() == null || userSignupDto.getName().trim().isEmpty()) {
                log.warn("회원가입 실패 - 이름 누락");
                return ResponseEntity.badRequest().body("이름을 입력해주세요.");
            }
            
            if (userSignupDto.getPassword() == null || userSignupDto.getPassword().trim().isEmpty()) {
                log.warn("회원가입 실패 - 비밀번호 누락");
                return ResponseEntity.badRequest().body("비밀번호를 입력해주세요.");
            }
            
            if (userSignupDto.getBlogName() == null || userSignupDto.getBlogName().trim().isEmpty()) {
                log.warn("회원가입 실패 - 블로그 이름 누락");
                return ResponseEntity.badRequest().body("블로그 이름을 입력해주세요.");
            }
            
            String result = userService.saveUser(userSignupDto);
            
            // 오류 메시지가 반환된 경우
            if (result.contains("이미 존재하는") || result.contains("형식이 올바르지") || result.contains("최소 8자리")) {
                log.warn("회원가입 실패 - {}", result);
                return ResponseEntity.badRequest().body(result);
            }
            
            log.info("회원가입 성공 - email: {}", userSignupDto.getEmail());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("회원가입 처리 중 오류 발생", e);
            return ResponseEntity.internalServerError().body("서버 오류가 발생했습니다: " + e.getMessage());
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

        if (user.getStatus().equals(UserStatus.DELETED)) {
            return ResponseEntity.badRequest().body("탈퇴한 회원이므로 로그인하실 수 없습니다.");
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
//    @PostMapping("/logout")
//    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authorizationHeader,
//                                    HttpServletResponse response) {
//        try {
//            // "Bearer {token}" → token만 추출
//            String accessToken = authorizationHeader.replace("Bearer ", "").trim();
//
//            Long userId = jwtTokenizer.getUserIdFromToken(accessToken);
//            User user = userService.findUserById(userId);
//
//            if (user == null) {
//                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("존재하지 않는 사용자입니다.");
//            }
//
//            user.setRefreshToken(null);
//            userService.editUser(user);
//
//            // 쿠키 삭제
//            Cookie accessCookie = new Cookie("accessToken", null);
//            accessCookie.setHttpOnly(true);
//            accessCookie.setPath("/");
//            accessCookie.setMaxAge(0);
//            response.addCookie(accessCookie);
//
//            Cookie refreshCookie = new Cookie("refreshToken", null);
//            refreshCookie.setHttpOnly(true);
//            refreshCookie.setPath("/");
//            refreshCookie.setMaxAge(0);
//            response.addCookie(refreshCookie);
//
//            return ResponseEntity.ok("로그아웃 되었습니다 !!");
//
//        } catch (Exception e) {
//            log.info("로그아웃 실패: " + e.getMessage());
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("유효하지 않은 토큰입니다.");
//        }
//    }

//    //회원 탈퇴로 상태 변경하기
//    @PostMapping("/delete")
//    public ResponseEntity<String> changeStatusDeleted(
//            @AuthenticationPrincipal CustomUserDetails customUserDetails,
//            @RequestBody UserDeleteRequest request
//    ) {
//        Long userId = customUserDetails.getUserId();
//        userService.changeUserStatusDeleted(userId, request);
//
//        return ResponseEntity.ok("회원 탈퇴를 성공하셨습니다");
//    }

    //로그아웃
//    @DeleteMapping("/logout")
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

    @PutMapping("/edit")
    public ResponseEntity<?> editUser(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @RequestBody UserUpdateDto updateDto) {

        Long tokenUserId = customUserDetails.getUserId();
        log.info("tokenUserId" + tokenUserId);

//        if (!tokenUserId.equals(updateDto.getId())) {
//            return ResponseEntity.status(HttpStatus.FORBIDDEN)
//                    .body("본인만 수정할 수 있습니다.");
//        }

        User user = userService.findUserById(tokenUserId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("해당 사용자를 찾을 수 없습니다.");
        }
        user.setId(user.getId());

        // 값이 존재할 때만 업데이트
        if (updateDto.getName() != null) {
            user.setName(updateDto.getName());
        }
        if (updateDto.getEmail() != null) {
            user.setEmail(updateDto.getEmail());
        }
        if (updateDto.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(updateDto.getPassword()));  // 비밀번호는 반드시 암호화
        }
        if (updateDto.getBlogName() != null) {
            user.getBlog().setName(updateDto.getBlogName());
        }
        if (updateDto.getCurrentProfilePhoto() != null) {
            user.setCurrentProfilePhoto(updateDto.getCurrentProfilePhoto());
        }

        userService.editUser(user);

        return ResponseEntity.ok(Map.of("message", "회원정보가 수정되었습니다."));
    }


    @DeleteMapping("/logout")
    public void logout() {
        rq.deleteCookie("accessToken");
        rq.deleteCookie("refreshToken");
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(){
        try {
            String accessToken = rq.getCookieValue("accessToken");
            log.debug("액세스 토큰: {}", accessToken);
            
            // 액세스 토큰이 없는 경우
            if (accessToken == null) {
                log.info("인증되지 않은 사용자가 /me 엔드포인트에 접근했습니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증 정보가 없습니다.");
            }
            
            Map<String, Object> claims = jwtTokenizer.parseAccessToken(accessToken);
            if (claims == null || !claims.containsKey("userId")) {
                log.warn("유효하지 않은 토큰: userId 클레임 없음");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("유효하지 않은 인증 정보입니다.");
            }
            
            Long userId = Long.parseLong(claims.get("userId").toString());
            User user = userService.findUserById(userId);


            if (user == null) {
                log.warn("ID {}에 해당하는 사용자를 찾을 수 없음", userId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("사용자 정보를 찾을 수 없습니다.");
            }

            String key = Optional.ofNullable(user.getCurrentProfilePhoto())
                    .map(Photo::getUrl)
                    .orElse(DEFAULT_IMAGE_URL);

            String url = s3V1Service.generateGetPresignedUrl(key).getUrl();


            return ResponseEntity.ok(new UserDto(user, url));
        } catch (Exception e) {
            log.error("사용자 정보 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("사용자 정보 조회 중 오류가 발생했습니다.");
        }
    }

    @PostMapping("/delete")
    public ResponseEntity<String> changeStatusDeleted(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @RequestBody UserDeleteRequest request
    ) {
        Long userId = customUserDetails.getUserId();
        userService.changeUserStatusDeleted(userId, request);

        return ResponseEntity.ok("회원 탈퇴를 성공하셨습니다");
    }


    @GetMapping("/top5")
    public ResponseEntity<List<UserResponse>> getTop5Users() {
        List<UserResponse> top5Users = userService.getTop5Bloggers();
        return ResponseEntity.ok(top5Users);

    }

}










