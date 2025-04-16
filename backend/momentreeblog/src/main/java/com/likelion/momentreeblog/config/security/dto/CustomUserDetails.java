package com.likelion.momentreeblog.config.security.dto;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
public class CustomUserDetails implements UserDetails {
    private final String username;
    private final String password;
    private final String email;  // 이메일 필드 추가
    private final List<GrantedAuthority> authorities; // 단일 Role로 수정
    private final Long userId;

    public CustomUserDetails(String username, String password, String email, List<GrantedAuthority> roles, Long userId) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.authorities = roles;
        this.userId = userId;

    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // 단일 role을 반환
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
