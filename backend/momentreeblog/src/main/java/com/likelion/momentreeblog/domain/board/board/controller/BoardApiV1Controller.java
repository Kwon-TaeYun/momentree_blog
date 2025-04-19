package com.likelion.momentreeblog.domain.board.board.controller;

import com.likelion.momentreeblog.config.security.dto.CustomUserDetails;
import com.likelion.momentreeblog.domain.board.board.dto.BoardDetailResponseDto;
import com.likelion.momentreeblog.domain.board.board.dto.BoardListResponseDto;
import com.likelion.momentreeblog.domain.board.board.dto.BoardRequestDto;
import com.likelion.momentreeblog.domain.board.board.entity.Board;
import com.likelion.momentreeblog.domain.board.board.repository.BoardRepository;
import com.likelion.momentreeblog.domain.board.board.service.BoardService;
import com.likelion.momentreeblog.domain.board.comment.dto.CommentDto;
import com.likelion.momentreeblog.domain.board.comment.dto.CommentRequestDto;
import com.likelion.momentreeblog.domain.board.comment.service.CommentService;
import com.likelion.momentreeblog.domain.board.like.dto.BoardLikeInfoDto;
import com.likelion.momentreeblog.domain.board.like.service.LikeService;
import com.likelion.momentreeblog.global.util.jwt.JwtTokenizer;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.hibernate.Hibernate;

import java.util.Collections;

@RestController
@Slf4j
@RequestMapping("/api/v1/boards")
@RequiredArgsConstructor
public class BoardApiV1Controller {
    private final BoardService boardService;
    private final LikeService likeService;
    private final JwtTokenizer jwtTokenizer;
    private final CommentService commentService;
    private final BoardRepository boardRepository;

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

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getBoard(@PathVariable Long id) {
        try {
            Board board = boardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));
        
        // 필요한 컬렉션들을 모두 초기화
        Hibernate.initialize(board.getPhotos());
        Hibernate.initialize(board.getLikes());
        
        BoardDetailResponseDto responseDto = BoardDetailResponseDto.from(board);
        return ResponseEntity.ok(responseDto);
    } catch (IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body("게시글 조회 실패! " + e.getMessage());
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

    //사용자별 게시글 조회
    @Operation(summary = "사용자별 게시글 조회")
//    @GetMapping("/searchById")
//    public ResponseEntity<?> searchBoardsByUserId(@CookieValue("accessToken") String token) {
//        Long userId = jwtTokenizer.getUserIdFromToken(token);
//        Page<BoardListResponseDto> result = boardService.searchBoardsByUserId(userId);
//
//        if(result.isEmpty()) {
//            return ResponseEntity.status(200).body("해당 사용자의 게시글이 없습니다.");
//        }
//        return ResponseEntity.ok(result);
//    }

    @GetMapping("/searchById")
    public ResponseEntity<?> searchBoardsByUserId(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증 정보가 없습니다.");
        }

        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            Long userId = userDetails.getUserId();
            Page<BoardListResponseDto> result = boardService.searchBoardsByUserId(userId);

            if (result.isEmpty()) {
                return ResponseEntity.ok(Collections.singletonMap("message", "해당 사용자의 게시글이 없습니다."));
            }

            return ResponseEntity.ok(result);
        } catch (ClassCastException e) {
            log.info("오류: " + e.getMessage());
            return ResponseEntity.status(500).body("인증 객체 형식 오류");
        } catch (Exception e) {
            log.info("오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("서버 오류가 발생했습니다.");
        }
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