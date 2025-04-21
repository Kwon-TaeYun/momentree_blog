package com.likelion.momentreeblog.domain.board.board.dto;

import com.likelion.momentreeblog.domain.board.category.entity.Category;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BoardEditResponseDto {
    private Long id;
    private String title;
    private String content;
    private String currentMainPhotoUrl;
    private String currentMainPhotoKey;
    private List<String> additionalPhotoUrls;
    private List<String> additionalPhotoKeys;
    private Category category;
}
