package com.likelion.momentreeblog.domain.board.comment.controller;

import com.likelion.momentreeblog.domain.board.comment.dto.CommentDto;
import com.likelion.momentreeblog.domain.board.comment.dto.CommentRequestDto;
import com.likelion.momentreeblog.domain.board.comment.service.CommentService;
import com.likelion.momentreeblog.util.jwt.JwtTokenizer;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/boards/{boardId}/comments")
@RequiredArgsConstructor
public class CommentApiV1Controller {

    private final CommentService commentService;
    private final JwtTokenizer jwtTokenizer;

    // 댓글 조회
    @GetMapping
    public ResponseEntity<Page<CommentDto>> getComments(
            @PathVariable Long boardId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<CommentDto> comments = commentService.getCommentsByBoardId(boardId, page, size);
        return ResponseEntity.ok(comments);
    }


    // 댓글 생성
    @PostMapping
    public ResponseEntity<?> createComment(
            @PathVariable(name = "boardId") Long boardId,
            @RequestBody @Valid CommentRequestDto dto,
            @RequestHeader("Authorization") String authorization
    ) {
        Long userId = jwtTokenizer.getUserIdFromToken(authorization);
        commentService.createComment(boardId, userId, dto);
        return ResponseEntity.ok("댓글 생성 완료!");
    }


    // 댓글 수정
    @PutMapping("/{commentId}")
    public ResponseEntity<String> updateComment(
            @PathVariable(name = "boardId") Long boardId,
            @PathVariable(name = "commentId") Long commentId,
            @RequestHeader("Authorization") String authorization,
            @RequestBody @Valid CommentRequestDto dto
    ) {
        Long userId = jwtTokenizer.getUserIdFromToken(authorization);
        commentService.updateComment(commentId, userId, boardId, dto);
        return ResponseEntity.ok("댓글 수정 완료!");
    }

    // 댓글 삭제
    @DeleteMapping("/{commentId}")
    public ResponseEntity<String> deleteComment(
            @PathVariable(name = "boardId") Long boardId,
            @PathVariable(name = "commentId") Long commentId,
            @RequestHeader("Authorization") String authorization
    ) {

        Long userId = jwtTokenizer.getUserIdFromToken(authorization);
        commentService.deleteComment(commentId, userId, boardId);
        return ResponseEntity.ok("댓글 삭제 완료");
    }
}
