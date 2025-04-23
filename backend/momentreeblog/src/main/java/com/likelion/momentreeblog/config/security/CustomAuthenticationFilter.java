package com.likelion.momentreeblog.config.security;

import com.likelion.momentreeblog.config.security.dto.CustomUserDetails;
import com.likelion.momentreeblog.config.security.exception.JwtExceptionCode;
import com.likelion.momentreeblog.config.security.token.JwtAuthenticationToken;
import com.likelion.momentreeblog.global.util.jwt.JwtTokenizer;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Component
@Slf4j
public class CustomAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenizer jwtTokenizer;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try {
            log.info("JwtAuthenticationFilter 실행!!!");
            // /api/v1/members/me 엔드포인트를 특별 처리
            String requestURI = request.getRequestURI();
            
            // 토큰을 얻어온다
            String token = getToken(request);
            
            // 토큰이 있으면 검증
            if (StringUtils.hasText(token)) {
                try {
                    Authentication authentication = getAuthentication(token);
                    if (authentication != null) {
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        log.info("JWT 인증 성공: {}", token);
                    } else {
                        log.warn("유효한 인증 정보를 얻을 수 없습니다.");
                    }
                } catch (ExpiredJwtException e) {
                    request.setAttribute("exception", JwtExceptionCode.EXPIRED_TOKEN.getCode());
                    log.error("만료된 토큰: {}", token, e);
                    SecurityContextHolder.clearContext();
                } catch (UnsupportedJwtException e) {
                    request.setAttribute("exception", JwtExceptionCode.UNSUPPORTED_TOKEN.getCode());
                    log.error("지원되지 않는 토큰: {}", token, e);
                    SecurityContextHolder.clearContext();
                } catch (MalformedJwtException e) {
                    request.setAttribute("exception", JwtExceptionCode.INVALID_TOKEN.getCode());
                    log.error("잘못된 토큰: {}", token, e);
                    SecurityContextHolder.clearContext();
                } catch (IllegalArgumentException e) {
                    request.setAttribute("exception", JwtExceptionCode.NOT_FOUND_TOKEN.getCode());
                    log.error("토큰을 찾을 수 없음: {}", token, e);
                    SecurityContextHolder.clearContext();
                } catch (Exception e) {
                    log.error("JWT 필터 - 내부 오류: {}", e.getMessage(), e);
                    SecurityContextHolder.clearContext();
                }
            } else {
                log.debug("JWT 토큰이 없습니다. 인증되지 않은 요청입니다.");
            }
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            log.error("JWT 필터 처리 중 예상치 못한 오류 발생", e);
            filterChain.doFilter(request, response);
        }
    }

    private void handleJwtException(HttpServletRequest request, JwtExceptionCode code, String token, Exception e) {
        SecurityContextHolder.clearContext();
        request.setAttribute("exception", code.getCode());
        log.error("{} : {}", code.name(), token, e);
        throw new BadCredentialsException(code.name() + " exception", e);
    }

    private Authentication getAuthentication(String token){
        try {
            if (token == null || token.isEmpty()) {
                log.warn("토큰이 없거나 비어 있습니다.");
                return null;
            }
            
            Claims claims = jwtTokenizer.parseAccessToken(token);
            log.info("JWT Claims: {}", claims);
            
            if (claims == null) {
                log.warn("JWT 클레임을 파싱할 수 없습니다.");
                return null;
            }
            
            String email = claims.getSubject();
            Long userId = claims.get("userId", Long.class);
            String username = claims.get("username", String.class);
            
            List<GrantedAuthority> grantedAuthorization = getGrantedAuthorization(claims);
            // UserDetails 생성
            CustomUserDetails customUserDetails = new CustomUserDetails(username, "", email, grantedAuthorization, userId);
            
            return new JwtAuthenticationToken(grantedAuthorization, customUserDetails, null);
        } catch (Exception e) {
            log.error("인증 정보 생성 중 오류 발생: {}", e.getMessage());
            return null;
        }
    }

    private List<GrantedAuthority> getGrantedAuthorization(Claims claims){
        try {
            List<String> roles = (List<String>)claims.get("roles");
            if (roles == null || roles.isEmpty()) {
                log.warn("권한 정보가 없습니다.");
                return List.of();
            }
            return roles.stream().map(SimpleGrantedAuthority::new).collect(Collectors.toList());
        } catch (Exception e) {
            log.error("권한 정보 변환 중 오류 발생: {}", e.getMessage());
            return List.of();
        }
    }

    private String getToken(HttpServletRequest request){
        // Authorization 헤더에서 토큰 추출
        String authorization = request.getHeader("Authorization");
        log.info("Authorization header: {}", authorization);
        
        if(StringUtils.hasText(authorization) && authorization.startsWith("Bearer ")){
            log.info("Extracting token from Authorization header");
            String token = authorization.substring(7).trim(); // "Bearer " 제거 후 공백도 제거
            if (token.isEmpty()) {
                log.warn("Authorization 헤더가 'Bearer '로 시작하지만 토큰이 비어 있습니다.");
                return null;
            }
            log.info("Extracted token: {}", token);
            return token;
        }
        
        // 쿠키에서 토큰 추출
        Cookie[] cookies = request.getCookies();
        if(cookies != null){
            for (Cookie cookie : cookies) {
                if("accessToken".equals(cookie.getName())){
                    String cookieValue = cookie.getValue();
                    if (cookieValue == null || cookieValue.isEmpty()) {
                        log.warn("accessToken 쿠키가 있지만 값이 비어 있습니다.");
                        return null;
                    }
                    log.info("Found accessToken in cookie: {}", cookieValue);
                    return cookieValue;
                }
            }
        }
        
        log.debug("토큰을 Authorization 헤더나 쿠키에서 찾을 수 없습니다.");
        return null;
    }
}
