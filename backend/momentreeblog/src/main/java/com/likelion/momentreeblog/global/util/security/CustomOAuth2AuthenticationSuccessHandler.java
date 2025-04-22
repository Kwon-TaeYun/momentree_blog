package com.likelion.momentreeblog.global.util.security;

import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.global.rq.Rq;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class CustomOAuth2AuthenticationSuccessHandler extends SavedRequestAwareAuthenticationSuccessHandler {
    private final Rq rq;

    @SneakyThrows
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        log.info("OAuth2 로그인 성공: {}", authentication.getName());
        
        // OAuth2 인증 정보 로깅
        if (authentication instanceof OAuth2AuthenticationToken) {
            OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
            OAuth2User oauth2User = oauthToken.getPrincipal();
            
            log.info("OAuth2 제공자: {}", oauthToken.getAuthorizedClientRegistrationId());
        }
        
        try {
            // 사용자 정보 가져오기
            User actor = rq.getActor();
            if (actor == null) {
                log.error("OAuth2 로그인 후 사용자 정보를 가져올 수 없습니다");
                response.sendRedirect("http://localhost:3000/members/login?error=user_not_found");
                return;
            }
            
            log.info("인증된 사용자: ID={}, 이름={}", actor.getId(), actor.getName());
            
            // 토큰 발급
            String accessToken = rq.makeAuthCookies(actor);
            log.info("JWT 토큰 발급 완료: {}", accessToken != null ? "성공" : "실패");
            
            // 리디렉션 URL 처리
            String redirectUrl = request.getParameter("state");
            log.info("원본 리디렉션 URL: {}", redirectUrl);
            
            // state 파라미터가 없으면 기본 URL로 리디렉션
            if (redirectUrl == null || redirectUrl.isEmpty()) {
                redirectUrl = "http://localhost:3000/home";
                log.info("리디렉션 URL이 없어 기본값으로 설정: {}", redirectUrl);
            }
    
            // URL 인코딩 문제 해결
            if (redirectUrl.contains("%")) {
                try {
                    String decodedUrl = java.net.URLDecoder.decode(redirectUrl, "UTF-8");
                    log.info("URL 디코딩: {} -> {}", redirectUrl, decodedUrl);
                    redirectUrl = decodedUrl;
                } catch (Exception e) {
                    log.error("URL 디코딩 실패", e);
                    redirectUrl = "http://localhost:3000/home";
                }
            }
    
            // 프론트 주소로 redirect
            log.info("리디렉션: {}", redirectUrl);
            response.sendRedirect(redirectUrl);
        } catch (Exception e) {
            log.error("OAuth2 인증 성공 처리 중 오류 발생", e);
            response.sendRedirect("http://localhost:3000/members/login?error=auth_error");
        }
    }
}
//백엔드에 있는 localhost:8090
//-> 프론트엔드 localhost:3000으로 처리된 것을 넘겨주는 기능
//성공했을 때 어디로 넘길것인지..
