package com.likelion.momentreeblog.domain.board.board.entity;

import com.likelion.momentreeblog.domain.blog.blog.entity.Blog;
import com.likelion.momentreeblog.domain.board.category.entity.Category;
import com.likelion.momentreeblog.domain.board.like.entity.Like;
import com.likelion.momentreeblog.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@ToString
@Table(name = "boards")
public class Board extends BaseEntity {
    @Column(nullable = false)
    private String title; // 제목

    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String content; // 내용

    @Column(name = "main_photo_id", nullable = false)
    private Long mainPhotoId; // 대표사진ID

    @Column(name = "photo_saved_url")
    private String photoSavedUrl; // 사진저장주소

    @ManyToOne
    @JoinColumn(name = "blog_id", nullable = false)
    private Blog blog; // 블로그 테이블

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToMany(mappedBy = "board", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Like> likes = new ArrayList<>(); // 좋아요 테이블
}
