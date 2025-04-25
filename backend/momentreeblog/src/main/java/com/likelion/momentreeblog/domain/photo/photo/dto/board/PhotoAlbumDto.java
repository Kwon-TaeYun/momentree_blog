package com.likelion.momentreeblog.domain.photo.photo.dto.board;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PhotoAlbumDto {
    private Long userId;
    private Long boardId;
    private String mainPhotoKey;
    private String mainPhotoUrl;
    private List<String> additionalPhotoKeys;
    private List<String> additionalPhotoUrls;
}
