package com.likelion.momentreeblog.domain.user.user.entity;

import com.likelion.momentreeblog.domain.blog.blog.entity.Blog;
import com.likelion.momentreeblog.domain.user.role.entity.Role;
import com.likelion.momentreeblog.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@ToString
public class User extends BaseEntity {
    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String oauth2;

    @Column(name = "oauth2_provider")
    private String oauth2Provider;

    @Column(nullable = false, name = "refresh_token")
    private String refreshToken;

    @Column(name = "profile_photo")
    private String profilePhoto;

    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @OneToOne
    @JoinColumn(name = "blog_id", nullable = false)
    private Blog blog;
}