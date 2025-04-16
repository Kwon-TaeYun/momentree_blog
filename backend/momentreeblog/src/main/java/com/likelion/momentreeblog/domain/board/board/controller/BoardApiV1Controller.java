package com.likelion.momentreeblog.domain.board.board.controller;

import com.likelion.momentreeblog.domain.board.board.dto.BoardListResponseDto;
import com.likelion.momentreeblog.domain.board.board.dto.BoardRequestDto;
import com.likelion.momentreeblog.domain.board.board.service.BoardService;
import com.likelion.momentreeblog.domain.board.comment.dto.CommentDto;
import com.likelion.momentreeblog.domain.board.comment.dto.CommentRequestDto;
import com.likelion.momentreeblog.domain.board.comment.service.CommentService;
import com.likelion.momentreeblog.domain.board.like.dto.BoardLikeInfoDto;
import com.likelion.momentreeblog.domain.board.like.service.LikeService;
import com.likelion.momentreeblog.global.util.jwt.JwtTokenizer;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/boards")
@RequiredArgsConstructor
public class BoardApiV1Controller {
    private final BoardService boardService;
    private final LikeService likeService;
    private final JwtTokenizer jwtTokenizer;
    private final CommentService commentService;

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
    public ResponseEntity<?> getBoards() {
        Page<BoardListResponseDto> boards = boardService.getBoardList();
        if(boards.isEmpty()){
            return ResponseEntity.ok("게시판이 없습니다.");
        }else {
            return ResponseEntity.ok(boards);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchBoards(@RequestParam("keyword") String keyword) {
        Page<BoardListResponseDto> result = boardService.searchBoardsByContent(keyword);

        if (result.isEmpty()) {
            return ResponseEntity
                    .status(200)
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
    // 댓글 조회
    @GetMapping("/{boardId}/comments")
    public ResponseEntity<?> getComments(
            @PathVariable(name = "boardId") Long boardId,
            @RequestParam(name = "page", defaultValue = "1") int page  // 기본값을 1로 설정
    ) {
        try {
            Page<CommentDto> comments = commentService.getCommentsByBoardId(boardId, page);
            if(comments.isEmpty()){
                return ResponseEntity.ok("댓글이 없습니다.");
            }else {
                return ResponseEntity.ok(comments);
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("댓글 조회 중 오류가 발생했습니다.");
        }
    }


    // 댓글 생성
    @PostMapping("/{boardId}/comments")
    public ResponseEntity<?> createComment(
            @PathVariable(name = "boardId") Long boardId,
            @RequestBody @Valid CommentRequestDto dto,
            @RequestHeader(name = "Authorization") String authorization
    ) {
        try {
            Long userId = jwtTokenizer.getUserIdFromToken(authorization);
            CommentDto savedComment = commentService.createComment(boardId, userId, dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedComment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("댓글 작성 실패: " + e.getMessage());
        }
    }

    // 댓글 수정
    @PutMapping("/{boardId}/comments/{commentId}")
    public ResponseEntity<?> updateComment(
            @PathVariable(name = "boardId") Long boardId,
            @PathVariable(name = "commentId") Long commentId,
            @RequestHeader(name = "Authorization") String authorization,
            @RequestBody @Valid CommentRequestDto dto
    ) {
        try {
            Long userId = jwtTokenizer.getUserIdFromToken(authorization);
            CommentDto updatedComment = commentService.updateComment(commentId, userId, boardId, dto);
            return ResponseEntity.ok(updatedComment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("댓글 수정 실패: " + e.getMessage());
        }
    }

    // 댓글 삭제
    @DeleteMapping("/{boardId}/comments/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable(name = "boardId") Long boardId,
            @PathVariable(name = "commentId") Long commentId,
            @RequestHeader(name = "Authorization") String authorization
    ) {
        try {
            Long userId = jwtTokenizer.getUserIdFromToken(authorization);
            commentService.deleteComment(commentId, userId, boardId);
            return ResponseEntity.ok("댓글 삭제 완료!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("댓글 삭제 실패: " + e.getMessage());
        }
    }






}
