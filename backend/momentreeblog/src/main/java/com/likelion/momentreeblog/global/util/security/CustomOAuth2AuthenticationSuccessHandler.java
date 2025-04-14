package com.likelion.momentreeblog.global.util.security;

import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.domain.user.user.service.UserService;
import com.likelion.momentreeblog.global.AppConfig;
import com.likelion.momentreeblog.global.rq.Rq;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class CustomOAuth2AuthenticationSuccessHandler extends SavedRequestAwareAuthenticationSuccessHandler {
//    private final UserService userService;
    private final Rq rq;

    @SneakyThrows
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        // rq.getActor() 시큐리티에서 로그인된 회원정보 가지고 오기
        User actor = rq.getActor();

        // 토큰 발급
        rq.makeAuthCookies(actor);

        String redirectUrl = request.getParameter("state");

        // 프론트 주소로 redirect
        response.sendRedirect(redirectUrl);
    }

}
//백엔드에 있는 localhost:8090
//-> 프론트엔드 localhost:3000으로 처리된 것을 넘겨주는 기능
//성공했을 때 어디로 넘길것인지..
