package com.likelion.momentreeblog.global.util.security;

import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.domain.user.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Map;

//oauth2 추가
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private final UserService userService;
    @Override
    @Transactional
    public SecurityUser loadUser(OAuth2UserRequest userRequest){
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String oauthId = oAuth2User.getName();
        String providerTypeCode = userRequest
                .getClientRegistration() // ClientRegistration
                .getRegistrationId()     // String
                .toUpperCase(Locale.getDefault());

        Map<String, Object> attributes = oAuth2User.getAttributes();
        Map<String, String> attributesProperties = (Map<String, String>) attributes.get("properties");
        String email = attributesProperties.get("nickname");
        //String profileImgUrl = attributesProperties.get("profile_image");
        String name = providerTypeCode + "__" + oauthId;
        //modifyOrJoin 추가: 서비스 회원가입
        User user = userService.modifyOrJoin(email, name, providerTypeCode);
        return new SecurityUser(
                user.getId(),
                user.getName(),
                "",
                user.getEmail(),
                user.getAuthorities()
        );
    }
}
