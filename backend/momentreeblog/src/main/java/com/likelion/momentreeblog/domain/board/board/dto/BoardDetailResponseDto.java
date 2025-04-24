package com.likelion.momentreeblog.domain.board.board.dto;

import com.likelion.momentreeblog.domain.board.board.entity.Board;
import com.likelion.momentreeblog.domain.s3.dto.response.PreSignedUrlResponseDto;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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
    private List<PreSignedUrlResponseDto>  additionalPhotoUrls;
    private PreSignedUrlResponseDto mainPhotoUrl;
    private PreSignedUrlResponseDto profilePhoto;
    private Long likeCount;
    private String blog;
    private String authorName;
    private String[] likeUsers;
    private Long authorId;
    private List<String> additionalPhotoKeys;
    private String currentMainPhotoKey;
    public static BoardDetailResponseDto from(Board board,
                                              PreSignedUrlResponseDto mainDto,
                                              List<PreSignedUrlResponseDto> additionalDtos,
                                              PreSignedUrlResponseDto profilePhoto
    ) {
        String[] likeUsersArray = board.getLikes() != null ?
                board.getLikes().stream()
                        .map(like -> like.getUser().getName()) // 좋아요 누른 사용자들의 이름
                        .toArray(String[]::new) : new String[0];

        // 추가 사진들의 key 리스트
        List<String> additionalKeys = additionalDtos.stream()
                .map(PreSignedUrlResponseDto::getKey)
                .collect(Collectors.toList());

        return BoardDetailResponseDto.builder()
                .id(board.getId())
                .title(board.getTitle())
                .content(board.getContent())
                .createdAt(board.getCreatedAt())
                .updatedAt(board.getUpdatedAt())
                .category(board.getCategory() != null ? board.getCategory().getName() : null)
                .blog(board.getBlog().getName())
                .authorId(board.getBlog().getUser().getId())
                .authorName(board.getBlog().getUser().getName())
                .mainPhotoUrl(mainDto)
                .additionalPhotoUrls(additionalDtos)
                .likeCount((long) board.getLikes().size())
                .likeUsers(likeUsersArray)
                .profilePhoto(profilePhoto)
                .additionalPhotoKeys(additionalKeys)
                .currentMainPhotoKey(mainDto.getKey())
                .build();
    }
}