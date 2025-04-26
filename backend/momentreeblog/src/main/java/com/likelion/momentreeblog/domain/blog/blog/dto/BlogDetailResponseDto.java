package com.likelion.momentreeblog.domain.blog.blog.dto;

import com.likelion.momentreeblog.domain.board.board.dto.BoardListResponseDto;
import lombok.*;
import org.springframework.data.domain.Page;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlogDetailResponseDto {
    private Long id;
    private String name;
    private String userName;
    private String userEmail;
    private String profileImage;
    private Long postsCount;
    private Page<BoardListResponseDto> boards; // 게시글 목록 페이징

    // 팔로우 관련 정보 추가
    private Long ownerId; // 블로그 주인 유저의 ID
    private boolean isFollowing; // 현재 로그인 유저가 이 블로그 주인을 팔로우하는지 여부
    private int followerCount; // 블로그 주인 유저의 팔로워 수
    private int followingCount; // 블로그 주인 유저의 팔로잉 수
}
