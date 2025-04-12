package com.likelion.momentreeblog.config.security.dto;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class CustomUserDetails implements UserDetails {
    private final String username;
    private final String password;
    private final String email; // 이메일 필드 추가
    private final List<GrantedAuthority> authorities;

    public CustomUserDetails(String username, String password, String email, List<GrantedAuthority> roles) {
        this.username = username;
        this.password = password;
        this.email = email;  // 이메일 값 저장
        this.authorities = roles;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
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
        return email;  // 이메일 반환
    }

    // 계정 만료 여부
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
