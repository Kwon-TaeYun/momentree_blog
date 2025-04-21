package com.likelion.momentreeblog.domain.board.board.dto;

import com.likelion.momentreeblog.domain.board.board.entity.Board;
import com.likelion.momentreeblog.domain.photo.photo.entity.Photo;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.likelion.momentreeblog.domain.user.user.entity.User;
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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String category;
    private String currentMainPhotoUrl;
    private List<String> photoUrls;
    private Long likeCount;
    private String blog;
    private String authorName;
    private String[] likeUsers;
    private Long authorId;
    public static BoardDetailResponseDto from(Board board) {
        String[] likeUsersArray = board.getLikes() != null ?
                board.getLikes().stream()
                        .map(like -> like.getUser().getName()) // 좋아요 누른 사용자들의 이름
                        .toArray(String[]::new) : new String[0];
        return BoardDetailResponseDto.builder()
                .id(board.getId())
                .title(board.getTitle())
                .content(board.getContent())
                .createdAt(board.getCreatedAt())
                .updatedAt(board.getUpdatedAt())
                .category(board.getCategory() != null ? board.getCategory().getName() : null)
                .currentMainPhotoUrl(board.getCurrentMainPhoto() != null ? board.getCurrentMainPhoto().getUrl() : null)
                .photoUrls(board.getPhotos().stream().map(Photo::getUrl).collect(Collectors.toList()))
                .likeCount((long) (board.getLikes() != null ? board.getLikes().size() : 0))
                .blog(board.getBlog().getName())
                .authorName(board.getBlog().getUser().getName())
                .likeUsers(likeUsersArray)
                .authorId(board.getBlog().getUser().getId())
                .build();
    }
}