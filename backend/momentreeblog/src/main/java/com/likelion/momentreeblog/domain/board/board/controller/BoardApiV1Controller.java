package com.likelion.momentreeblog.domain.board.board.controller;

import com.likelion.momentreeblog.domain.board.board.dto.BoardListResponseDto;
import com.likelion.momentreeblog.domain.board.board.dto.BoardRequestDto;
import com.likelion.momentreeblog.domain.board.board.dto.BoardResponseDto;
import com.likelion.momentreeblog.domain.board.board.service.BoardService;
import com.likelion.momentreeblog.domain.board.like.dto.BoardLikeInfoDto;
import com.likelion.momentreeblog.domain.board.like.service.LikeService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/boards")
@RequiredArgsConstructor
public class BoardApiV1Controller {
    private final BoardService boardService;
    private final LikeService likeService;

    @Operation(summary = "게시글 작성", description = "새로운 게시글 작성")
    @PostMapping
    public ResponseEntity<String> createBoard(@Valid @RequestBody BoardRequestDto requestDto) {
        String message = boardService.createBoard(requestDto);
        return ResponseEntity.ok(message);

    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateBoard(@PathVariable(name="id") Long id, @Valid @RequestBody BoardRequestDto requestDto) {
        String message = boardService.updateBoard(id, requestDto);
        return ResponseEntity.ok(message);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBoard(@PathVariable(name="id") Long id) {
         String message = boardService.deleteBoard(id);
         return ResponseEntity.ok(message);
    }

    @GetMapping
    public ResponseEntity<Page<BoardListResponseDto>> getBoards() {
        Page<BoardListResponseDto> boards = boardService.getBoardList();
        return  ResponseEntity.ok(boards);
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchBoards(@RequestParam("keyword") String keyword) {
        Page<BoardListResponseDto> result = boardService.searchBoardsByContent(keyword);

        if (result.isEmpty()) {
            return ResponseEntity
                    .status(404)
                    .body("검색 결과가 없습니다.");
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{boardId}/likes")
    public ResponseEntity<BoardLikeInfoDto> likeBoardList(@PathVariable(name = "boardId") Long boardId) {
        BoardLikeInfoDto boardLikeInfo = likeService.getBoardLikeInfo(boardId);
        return ResponseEntity.ok(boardLikeInfo);
    }


    @PostMapping("/{boardId}/likes")
    public ResponseEntity<String> likeBoard(
            @PathVariable(name = "boardId") Long boardId,
            @RequestParam(name = "userId") Long userId
    ){
        String result = likeService.likeBoard(userId, boardId);
        return ResponseEntity.ok(result);
    }




}
