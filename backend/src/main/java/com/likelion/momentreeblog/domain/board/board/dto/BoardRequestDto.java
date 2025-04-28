package com.likelion.momentreeblog.domain.board.board.dto;

import com.likelion.momentreeblog.domain.board.board.entity.Board;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class BoardRequestDto {
    @NotBlank(message = "제목을 입력하세요")
    private String title;

    @NotBlank(message = "내용을 입력하세요")
    private String content;

    @NotNull(message = "대표 사진이 없습니다.")
    private String currentMainPhotoUrl;

    private Long categoryId;
    private List<String> photoUrls;
    private String currentMainPhotoKey;
    private List<String> additionalPhotoUrls = new ArrayList<>();
    private List<String> additionalPhotoKeys = new ArrayList<>();

    public static BoardRequestDto from(Board board,
                                       String mainDto,
                                       List<String> additionalDtos
                                       ) {


        BoardRequestDto dto = new BoardRequestDto();
        dto.setTitle(board.getTitle());
        dto.setContent(board.getContent());
        dto.setCategoryId(board.getCategory().getId());
        dto.setCurrentMainPhotoKey(mainDto);
        dto.setAdditionalPhotoUrls(additionalDtos);
        dto.setCurrentMainPhotoUrl(mainDto);
        dto.setAdditionalPhotoKeys(additionalDtos);
        dto.setPhotoUrls(new ArrayList<>());
        return dto;
    }

}
