package com.likelion.momentreeblog.domain.blog.blog.entity;

import com.likelion.momentreeblog.domain.user.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Blog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long blogId;

    @Column(nullable = false, length = 255)
    private String blogName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Long viewCount;

    @OneToOne(mappedBy = "blog")
    private User user;  // 유저가 1:1로 소유
}
