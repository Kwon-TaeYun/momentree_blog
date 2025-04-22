package com.likelion.momentreeblog.global.util.security;

import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.domain.user.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Map;

//oauth2 추가
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private final UserService userService;
    
    @Override
    @Transactional
    public SecurityUser loadUser(OAuth2UserRequest userRequest) {
        try {
            log.info("OAuth2 로그인 요청 시작: provider={}", userRequest.getClientRegistration().getRegistrationId());
            
            OAuth2User oAuth2User = super.loadUser(userRequest);
            String oauthId = oAuth2User.getName();
            log.info("OAuth2 ID: {}", oauthId);
            
            String providerTypeCode = userRequest
                    .getClientRegistration()
                    .getRegistrationId()
                    .toUpperCase(Locale.getDefault());
            log.info("제공자 코드: {}", providerTypeCode);
            
            // 카카오 응답 구조 처리
            Map<String, Object> attributes = oAuth2User.getAttributes();
            log.info("OAuth2 속성: {}", attributes);
            
            String email = "";
            String name = "";
            
            if ("KAKAO".equals(providerTypeCode)) {
                // 카카오는 properties 필드에 사용자 정보를 포함
                Map<String, Object> properties = (Map<String, Object>) attributes.get("properties");
                if (properties != null) {
                    name = (String) properties.get("nickname");
                    log.info("카카오 nickname: {}", name);
                }
                
                // 이메일 대신 nickname을 사용
                email = name;
                if (email == null || email.isEmpty()) {
                    email = oauthId + "@kakao.user";
                }
            } else {
                // 다른 제공자의 경우 필요시 추가
                email = oauthId + "@" + providerTypeCode.toLowerCase() + ".user";
                name = providerTypeCode + "_" + oauthId;
            }
            
            log.info("최종 사용자 정보: email={}, name={}", email, name);
            
            // DB에 사용자 등록 또는 업데이트
            User user = userService.modifyOrJoin(email, name, providerTypeCode);
            log.info("사용자 처리 완료: ID={}, 이름={}", user.getId(), user.getName());
            
            return new SecurityUser(
                    user.getId(),
                    user.getName(),
                    "",
                    user.getEmail(),
                    user.getAuthorities()
            );
        } catch (Exception e) {
            log.error("OAuth2 사용자 로드 중 오류 발생", e);
            throw new OAuth2AuthenticationException("OAuth2 인증 처리 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}
