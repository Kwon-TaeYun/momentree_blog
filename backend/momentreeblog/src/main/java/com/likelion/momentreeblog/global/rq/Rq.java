package com.likelion.momentreeblog.global.rq;

import com.likelion.momentreeblog.domain.blog.blog.repository.BlogRepository;
import com.likelion.momentreeblog.domain.user.role.entity.Role;
import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.domain.user.user.repository.UserRepository;
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

import java.util.ArrayList;
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

//    public User getActor() {
//        return Optional.ofNullable(
//                        SecurityContextHolder
//                                .getContext()
//                                .getAuthentication()
//                )
//                .map(Authentication::getPrincipal)
//                .filter(principal -> principal instanceof SecurityUser)
//                .map(principal -> (SecurityUser) principal)
//                .map(securityUser -> userRepository.findById(securityUser.getId()).orElse(null)) // ← 여기서 DB 조회
//                .orElse(null);
//    }


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
        List<String> authorities = new ArrayList<>();
        List<String> roleNames = user.getRoles()
                .stream()
                .map(Role::getName)
                .collect(Collectors.toList());
        if (user.getRoles() != null) {
            authorities = user.getRoles().stream()
                    .map(Role::getName)  // 여기서는 getAuthority()가 아닌 getName()을 사용
                    .collect(Collectors.toList());
        }
        String accessToken = jwtTokenizer.createAccessToken(user.getId(),user.getEmail(),user.getName(),authorities);
        String refreshToken = jwtTokenizer.createRefreshToken(user.getId(),user.getEmail(),user.getName(),authorities);

        User persistentUser = userRepository.findById(user.getId()).orElseThrow();
        persistentUser.setRefreshToken(refreshToken);
        persistentUser.setOauth2(accessToken);
// save 생략 가능 (@Transactional이면 dirty checking 됨)
        userRepository.save(persistentUser);

         setCookie("refreshToken", refreshToken);
        setCookie("accessToken", accessToken);

        return accessToken;
    }




}
