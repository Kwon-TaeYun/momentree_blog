package com.likelion.momentreeblog.global.util.jwt;

import com.likelion.momentreeblog.domain.user.role.entity.Role;
import com.likelion.momentreeblog.domain.user.user.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.List;

@Slf4j
@Component
public class JwtTokenizer {
    private final byte[] accessSecret;
    private final byte[] refreshSecret;

    public static Long ACCESS_TOKEN_EXPIRE_COUNT = 30 * 60 * 1000L; //유지시간 30분
    public static Long REFRESH_TOKEN_EXPIRE_COUNT = 7 * 24 * 60 * 1000L;

    public JwtTokenizer(
            @Value("${custom.jwt.secretKey}") String accessSecret,
            @Value("${custom.jwt.refreshKey}") String refreshSecret
    ) {
        this.accessSecret = accessSecret.getBytes(StandardCharsets.UTF_8);
        this.refreshSecret = refreshSecret.getBytes(StandardCharsets.UTF_8);
    }

    public Long extractUserIdFromAuthorization(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Authorization 헤더가 유효하지 않습니다.");
        }

        return getUserIdFromToken(authorization);
    }

    private String createToken(Long id, String email, String username, List<String> roles, Long expire, byte[] secretKey){
        Claims claims = Jwts.claims().setSubject(email); //고유한 식별자 값
        claims.put("username", username);
        claims.put("userId", id);
        claims.put("roles", roles);
        return Jwts.builder().setClaims(claims)
                .setIssuedAt(new Date())
                .setExpiration(new Date(new Date().getTime()+expire)) //expire 1000 * 60 * 60 = 1시간
                .signWith(getSigningKey(secretKey))
                .compact();
    }

    private static Key getSigningKey(byte[] secretKey){
        return Keys.hmacShaKeyFor(secretKey);
    }

    public String createAccessToken(Long id, String email, String username, List<String> roles){
        System.out.println("Roles in Token: " + roles);
        return createToken(id, email, username, roles, ACCESS_TOKEN_EXPIRE_COUNT, accessSecret);
    }

    //REFRESH_TOKEN 생성하는 메서드
    public String createRefreshToken(Long id, String email, String username, List<String> roles){
        return createToken(id, email, username, roles,REFRESH_TOKEN_EXPIRE_COUNT, refreshSecret);
    }

    public Claims parseToken(String token, byte[] secretKey){
        return Jwts.parserBuilder().setSigningKey(getSigningKey(secretKey))
                .build().parseClaimsJws(token)
                .getBody();
    }

    public Claims parseAccessToken(String accessToken){
        return parseToken(accessToken, accessSecret);
    }

    public Claims parseRefreshToken(String refreshToken){
        return parseToken(refreshToken, refreshSecret);
    }

    public Long getUserIdFromToken(String token){
        if(token == null || token.isBlank()){
            throw new IllegalArgumentException("Jwt 토큰이 없습니다.");
        }
        log.info("현재 엑세스 토큰: " + token);

        if(token.startsWith("Bearer ")) {
            token = token.substring(7).trim(); // 공백 제거도 같이
        } else {
            throw new IllegalArgumentException("bearer 유효하지 않은 토큰입니다.");
        }
        Claims claims = parseToken(token, accessSecret);
        if(claims == null){
            throw new IllegalArgumentException("claim 유효하지 않은 토큰입니다.");
        }
        Object userId = claims.get("userId");
        if(userId instanceof Number){
            return ((Number)userId).longValue();
        }else{
            throw new IllegalArgumentException("Jwt 토큰에서 userId를 찾을 수 없습니다.");
        }
    }

}
