package com.likelion.momentreeblog.domain.board.board.dto;

import com.likelion.momentreeblog.domain.board.board.entity.Board;
import com.likelion.momentreeblog.domain.photo.photo.entity.Photo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.stream.Collectors;

@Data
public class BoardRequestDto {
    @NotBlank(message = "제목을 입력하세요")
    private String title;

    @NotBlank(message = "내용을 입력하세요")
    private String content;

    @NotNull(message = "대표 사진이 없습니다.")
    private String currentMainPhotoUrl;

    private List<String> photoUrls;

    private Long categoryId;

    public static BoardRequestDto from(Board board) {
        BoardRequestDto dto = new BoardRequestDto();
        dto.setTitle(board.getTitle());
        dto.setContent(board.getContent());
        dto.setCurrentMainPhotoUrl(board.getCurrentMainPhoto().getUrl());
        dto.setPhotoUrls(board.getPhotos().stream()
                .map(Photo::getUrl)
                .collect(Collectors.toList()));
        dto.setCategoryId(board.getCategory().getId());
        return dto;
    }

}
