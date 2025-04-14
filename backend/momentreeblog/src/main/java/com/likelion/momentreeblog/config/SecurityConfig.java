package com.likelion.momentreeblog.config;
import com.likelion.momentreeblog.config.security.CustomAuthenticationFilter;
//import com.likelion.momentreeblog.config.security.exception.CustomAuthenticationEntryPoint;
import com.likelion.momentreeblog.global.util.jwt.JwtTokenizer;
import com.likelion.momentreeblog.global.util.security.CustomAuthorizationRequestResolver;
import com.likelion.momentreeblog.global.util.security.CustomOAuth2AuthenticationSuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;


@Configuration
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtTokenizer jwtTokenizer;
    //private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint;
    private final CustomOAuth2AuthenticationSuccessHandler customOAuth2AuthenticationSuccessHandler;
    private final CustomAuthorizationRequestResolver customAuthorizationRequestResolver;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .formLogin(form -> form.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/",
                                "/api/**",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/swagger-ui.html",
                                "/h2-console/**",
                                "/admin/api/v1/**"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2Login -> oauth2Login
                        .successHandler(customOAuth2AuthenticationSuccessHandler)
                        .authorizationEndpoint(
                                authorizationEndpoint ->
                                        authorizationEndpoint
                                                .authorizationRequestResolver(customAuthorizationRequestResolver)
                        )
                )
                .addFilterBefore(new CustomAuthenticationFilter(jwtTokenizer), UsernamePasswordAuthenticationFilter.class)
                .formLogin(form->form.disable())
                .sessionManagement(session-> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .csrf(csrf->csrf.disable())
                .httpBasic(httpBasic->httpBasic.disable())//기본으로 헤더에 유저정보를 저장하나, 보안에 취약하므로 뺀다
                .cors(cors->cors.configurationSource(configurationSource()))
              //  .exceptionHandling(exception->exception.authenticationEntryPoint(customAuthenticationEntryPoint))

                .headers(headers -> headers
                        .frameOptions(frame -> frame.disable())
                );

        return http.build();
    }


    public CorsConfigurationSource configurationSource(){
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("*"); //http://example.com
        config.addAllowedHeader("*"); //content-type 같은 헤더 정보
        config.addAllowedMethod("*");
        config.addAllowedOrigin("http://localhost:3000");
        config.setAllowedMethods(List.of("GET","POST","DELETE"));
        source.registerCorsConfiguration("/**",config);
        return source;
    }//허용하는 부분 설정

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
