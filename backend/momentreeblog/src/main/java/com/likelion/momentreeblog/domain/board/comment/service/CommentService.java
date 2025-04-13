package com.likelion.momentreeblog.domain.board.comment.service;

import com.likelion.momentreeblog.domain.board.board.entity.Board;
import com.likelion.momentreeblog.domain.board.board.repository.BoardRepository;
import com.likelion.momentreeblog.domain.board.comment.dto.CommentDto;
import com.likelion.momentreeblog.domain.board.comment.dto.CommentRequestDto;
import com.likelion.momentreeblog.domain.board.comment.entity.Comment;
import com.likelion.momentreeblog.domain.board.comment.repository.CommentRepository;
import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.domain.user.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final BoardRepository boardRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;

    //댓글 조회, 게시글 id로 조회
    @Transactional(readOnly = true)
    public Page<CommentDto> getCommentsByBoardId(Long boardId, int pageFromUser, int size) {
        if (!boardRepository.existsById(boardId)) {
            throw new IllegalArgumentException("현재 게시물이 존재하지 않습니다.  boardId ::  " + boardId);
        }

        int page = Math.max(pageFromUser - 1, 0); // 최소 0 이상
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        return commentRepository.findByBoardId(boardId, pageable)
                .map(comment -> CommentDto.builder()
                        .id(comment.getId())
                        .userId(comment.getUser().getId())
                        .boardId(comment.getBoard().getId())
                        .content(comment.getContent())
                        .createdAt(comment.getCreatedAt())
                        .updatedAt(comment.getUpdatedAt())
                        .build()
                );
    }


    //댓글 생성
    @Transactional
    public CommentDto createComment(Long boardId, Long userId, CommentRequestDto commentRequestDto) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다"));

        Comment comment = Comment.builder()
                .board(board)
                .user(user)
                .content(commentRequestDto.getContent())
                .build();

        return CommentDto.builder()
                .id(comment.getId())
                .userId(comment.getUser().getId())
                .boardId(comment.getBoard().getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }


    //댓글 수정
    @Transactional
    public CommentDto updateComment(Long commentId, Long userId, Long boardId, CommentRequestDto dto) {

        //댓글의 사용자와 게시글 존재 확인 검증
        if (!commentRepository.existsByIdAndUserIdAndBoardId(commentId, userId, boardId)) {
            throw new IllegalArgumentException("해당 댓글이 없거나 수정 권한이 없습니다.");
        }

        //댓글 찾아오기
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글이 존재하지 않습니다.  댓글id :: " + commentId));


        comment.setContent(dto.getContent());

        return CommentDto.builder()
                .id(comment.getId())
                .userId(comment.getUser().getId())
                .boardId(comment.getBoard().getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }


    //댓글 삭제
    @Transactional
    public void deleteComment(Long commentId, Long userId, Long boardId) {

        if (!commentRepository.existsByIdAndUserIdAndBoardId(commentId, userId, boardId)) {
            throw new IllegalArgumentException("해당 댓글이 없거나 삭제 권한이 없습니다.");
        }

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글이 존재하지 않습니다.  댓글id :: " + commentId));



        commentRepository.deleteById(commentId);
    }
}
