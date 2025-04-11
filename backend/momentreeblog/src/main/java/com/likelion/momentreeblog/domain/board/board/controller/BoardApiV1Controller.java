package com.likelion.momentreeblog.domain.board.board.controller;

import com.likelion.momentreeblog.domain.board.board.dto.BoardListResponseDto;
import com.likelion.momentreeblog.domain.board.board.dto.BoardRequestDto;
import com.likelion.momentreeblog.domain.board.board.dto.BoardResponseDto;
import com.likelion.momentreeblog.domain.board.board.service.BoardService;
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

    @Operation(summary = "게시글 작성", description = "새로운 게시글 작성")
    @PostMapping
    public ResponseEntity<String> createBoard(@Valid @RequestBody BoardRequestDto requestDto) {
        String message = boardService.createBoard(requestDto);
        return ResponseEntity.ok(message);

    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateBoard(@PathVariable Long id, @Valid @RequestBody BoardRequestDto requestDto) {
        String message = boardService.updateBoard(id, requestDto);
        return ResponseEntity.ok(message);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBoard(@PathVariable Long id) {
         String message = boardService.deleteBoard(id);
         return ResponseEntity.ok(message);
    }

    @GetMapping
    public ResponseEntity<Page<BoardListResponseDto>> getBoards(Pageable pageable) {
        Page<BoardListResponseDto> boards = boardService.getBoardList(pageable);
        return  ResponseEntity.ok(boards);
    }


}
