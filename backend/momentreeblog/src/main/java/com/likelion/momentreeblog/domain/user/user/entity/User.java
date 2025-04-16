package com.likelion.momentreeblog.domain.user.user.entity;

import com.likelion.momentreeblog.domain.blog.blog.entity.Blog;
import com.likelion.momentreeblog.domain.user.role.entity.Role;
import com.likelion.momentreeblog.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.*;
import java.util.stream.Collectors;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@ToString
public class User extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column
    private String password;

    private String oauth2;

    @Column(name = "oauth2_provider")
    private String oauth2Provider;

    @Column(name = "refresh_token")
    private String refreshToken;

    @Column(name = "profile_photo")
    private String profilePhoto;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private List<Role> roles;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "blog_id")
    private Blog blog;

    public void setBlog(Blog blog) {
        this.blog = blog;
        if (blog.getUser() != this) {
            blog.setUser(this);
        }
    }

    public User(long id, String username, String nickname) {
        this.setId(id);
        this.name = username;
        this.email = nickname;
    }

    public List<String> getAuthoritiesAsStringList() {
        List<String> authorities = new ArrayList<>();
        if (isAdmin()) authorities.add("ROLE_ADMIN");
        return authorities;
    }

    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority(role.getName()))
                .collect(Collectors.toList());
    }

    public boolean isAdmin() {
        return "admin".equals(name);
    }
}