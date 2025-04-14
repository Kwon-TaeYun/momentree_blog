package com.likelion.momentreeblog.domain.blog.blog.entity;

import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "blogs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Blog extends BaseEntity {
    @OneToOne(mappedBy = "blog") // User가 주인, Blog가 피소유자
    private User user;
    @Column(nullable = false)
    private String name;
    @Column(name = "view_count", columnDefinition = "BIGINT default 0")
    private Long viewCount;
}
