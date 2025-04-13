package com.likelion.momentreeblog.domain.board.board.controller;

import com.likelion.momentreeblog.domain.board.board.dto.BoardListResponseDto;
import com.likelion.momentreeblog.domain.board.board.dto.BoardRequestDto;
import com.likelion.momentreeblog.domain.board.board.dto.BoardResponseDto;
import com.likelion.momentreeblog.domain.board.board.service.BoardService;
import com.likelion.momentreeblog.domain.board.like.dto.BoardLikeInfoDto;
import com.likelion.momentreeblog.domain.board.like.service.LikeService;
import com.likelion.momentreeblog.util.jwt.JwtTokenizer;
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
    private final JwtTokenizer jwtTokenizer;

    @Operation(summary = "게시글 작성", description = "새로운 게시글 작성")
    @PostMapping
    public ResponseEntity<String> createBoard(
            @RequestHeader(value = "Authorization") String authorization,
            @Valid @RequestBody BoardRequestDto requestDto) {
        try {
            Long userId = jwtTokenizer.getUserIdFromToken(authorization);

            String message = boardService.createBoard(requestDto, userId);
            return ResponseEntity.ok(message);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body("인증 정보가 잘못되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("게시글 작성 실패! " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateBoard(
            @RequestHeader(value = "Authorization") String authorization,
            @PathVariable(name = "id") Long id,
            @Valid @RequestBody BoardRequestDto requestDto) {
        try {
            Long userId = jwtTokenizer.getUserIdFromToken(authorization);
            String message = boardService.updateBoard(id, userId, requestDto);
            return ResponseEntity.ok(message);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("게시글 수정 실패! " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBoard(
            @RequestHeader(value = "Authorization") String authorization,
            @PathVariable(name = "id") Long id) {
        try {
            Long userId = jwtTokenizer.getUserIdFromToken(authorization);
            String message = boardService.deleteBoard(id, userId);
            return ResponseEntity.ok(message);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("게시글 삭제 실패! " + e.getMessage());
        }
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
    public ResponseEntity<?> likeBoardList(@PathVariable(name = "boardId") Long boardId) {
        try {
            BoardLikeInfoDto boardLikeInfo = likeService.getBoardLikeInfo(boardId);
            return ResponseEntity.ok(boardLikeInfo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body("해당 게시물을 찾을 수 없습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("좋아요 정보 조회 실패: " + e.getMessage());
        }
    }



    @PostMapping("/{boardId}/likes")
    public ResponseEntity<String> likeBoard(
            @RequestHeader(value = "Authorization") String authorization,
            @PathVariable(name = "boardId") Long boardId) {
        try {
            Long userId = jwtTokenizer.getUserIdFromToken(authorization);

            String result = likeService.likeBoard(userId, boardId);

            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body("인증 정보가 잘못되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("좋아요 실패! " + e.getMessage());
        }
    }





}
