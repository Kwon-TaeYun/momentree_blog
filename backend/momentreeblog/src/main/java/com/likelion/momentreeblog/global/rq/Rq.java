package com.likelion.momentreeblog.global.rq;

import com.likelion.momentreeblog.domain.blog.blog.entity.Blog;
import com.likelion.momentreeblog.domain.blog.blog.repository.BlogRepository;
import com.likelion.momentreeblog.domain.user.role.entity.Role;
import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.domain.user.user.repository.UserRepository;
import com.likelion.momentreeblog.domain.user.user.service.UserService;
import com.likelion.momentreeblog.global.util.jwt.JwtTokenizer;
import com.likelion.momentreeblog.global.util.security.SecurityUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RequestScope
@Component
@RequiredArgsConstructor
public class Rq {
    private final HttpServletRequest req;
    private final HttpServletResponse resp;
//    private final UserService userService;
    private final JwtTokenizer jwtTokenizer;
    private final UserRepository userRepository;
    private final BlogRepository blogRepository;

    public void setLogin(User member) {
        UserDetails user = new SecurityUser(
                member.getId(),
                member.getEmail(),
                "",
                member.getName(),
                member.getAuthorities()  // 권한 목록을 넘겨줌
        );

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user,
                user.getPassword(),
                user.getAuthorities()
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    public User getActor() {
        return Optional.ofNullable(
                        SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                )
                .map(Authentication::getPrincipal)
                .filter(principal -> principal instanceof SecurityUser)
                .map(principal -> (SecurityUser) principal)
                .map(securityUser -> new User(securityUser.getId(), securityUser.getUsername(), securityUser.getNickname()))
                .orElse(null);
    }


    public void setCookie(String name, String value) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .path("/")
                .domain("localhost")
                .sameSite("Strict")
                .secure(true)
                .httpOnly(true)
                .build();
        resp.addHeader("Set-Cookie", cookie.toString());
    }

    public String getCookieValue(String name) {
        return Optional
                .ofNullable(req.getCookies())
                .stream() // 1 ~ 0
                .flatMap(cookies -> Arrays.stream(cookies))
                .filter(cookie -> cookie.getName().equals(name))
                .map(cookie -> cookie.getValue())
                .findFirst()
                .orElse(null);
    }

    public void deleteCookie(String name) {
        ResponseCookie cookie = ResponseCookie.from(name, null)
                .path("/")
                .domain("localhost")
                .sameSite("Strict")
                .secure(true)
                .httpOnly(true)
                .maxAge(0)
                .build();

        resp.addHeader("Set-Cookie", cookie.toString());
    }

    public void setHeader(String name, String value) {
        resp.setHeader(name, value);
    }

    public String getHeader(String name) {
        return req.getHeader(name);
    }

    public void refreshAccessToken(User user) {
        List<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());
        String newAccessToken = jwtTokenizer.createAccessToken(user.getId(),user.getEmail(),user.getName(), roleNames);

        setHeader("Authorization", "Bearer " + user.getRefreshToken() + " " + newAccessToken);
        setCookie("accessToken", newAccessToken);

    }

    public String makeAuthCookies(User user) {
        // 1. User 객체가 DB에 저장되지 않았다면 먼저 저장해야 합니다.
        if (user.getId() == null) {
            userRepository.save(user);  // User 객체를 DB에 먼저 저장
        }

        // 2. User 객체가 blog를 가지고 있는지 확인
        if (user.getBlog() == null) {
            // blog가 없다면 새로운 blog를 생성하거나 기존 blog를 할당
            Blog newBlog = Blog.builder()
                    .name(user.getName() + "'s Blog")  // 블로그 제목 설정
                    .build();
            user.setBlog(newBlog);  // User에 blog 설정
            blogRepository.save(newBlog);  // Blog 저장
        }

        // 3. 이후 DB에서 생성된 ID와 필요한 값들을 사용하여 토큰 생성
        List<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        // accessToken 및 refreshToken 생성
        String accessToken = jwtTokenizer.createAccessToken(user.getId(), user.getEmail(), user.getName(), roleNames);
        String refreshToken = jwtTokenizer.createRefreshToken(user.getId(), user.getEmail(), user.getName(), roleNames);

        // 4. refreshToken을 User 객체에 설정
        user.setRefreshToken(refreshToken);

        // 5. User 객체를 DB에 반영 (refreshToken 저장)
        userRepository.save(user);  // DB에 업데이트된 User 객체 저장

        // 6. 쿠키에 토큰 저장
        setCookie("apiKey", refreshToken);
        setCookie("accessToken", accessToken);

        return accessToken;  // 생성된 accessToken 반환
    }




}
