package com.likelion.momentreeblog.domain.user.follower.entity;

import com.likelion.momentreeblog.domain.user.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Follower {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 팔로우한 사람
    @ManyToOne
    @JoinColumn(name = "follower_id", nullable = false)
    private User follower;

    // 팔로우 당한 사람
    @ManyToOne
    @JoinColumn(name = "following_id", nullable = false)
    private User following;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
