package com.likelion.momentreeblog.domain.board.board.dto;

import com.likelion.momentreeblog.domain.blog.blog.entity.Blog;
import com.likelion.momentreeblog.domain.board.board.entity.Board;
import com.likelion.momentreeblog.domain.board.category.entity.Category;
import com.likelion.momentreeblog.domain.board.like.entity.Like;
import com.likelion.momentreeblog.domain.photo.photo.entity.Photo;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class BoardDetailResponseDto {
    private Long id;
    private String title;
    private String content;
    private Blog blog;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Category category;
    private Photo currentMainPhoto;
    private List<Photo> photos;
    private List<Like> likes;

    public static BoardDetailResponseDto from(Board board) {
        return BoardDetailResponseDto.builder()
                .id(board.getId())
                .title(board.getTitle())
                .content(board.getContent())
                .blog(board.getBlog())
                .createdAt(board.getCreatedAt())
                .updatedAt(board.getUpdatedAt())
                .category(board.getCategory())
                .currentMainPhoto(board.getCurrentMainPhoto())
                .photos(board.getPhotos())
                .likes(board.getLikes())
                .build();
    }
}