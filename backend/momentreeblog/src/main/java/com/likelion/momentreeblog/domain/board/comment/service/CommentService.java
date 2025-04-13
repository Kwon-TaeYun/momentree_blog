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

    @Transactional(readOnly = true)
    public Page<CommentDto> getCommentsByBoardId(Long boardId, int pageFromUser) {
        validateBoardExists(boardId);

        int page = Math.max(pageFromUser - 1, 0);  // pageFromUser는 int로 처리
        Pageable pageable = PageRequest.of(page, 10, Sort.by(Sort.Direction.DESC, "createdAt"));

        return commentRepository.findByBoardIdOrderByCreatedAtDesc(boardId, pageable)
                .map(this::toDto);
    }


    @Transactional
    public CommentDto createComment(Long boardId, Long userId, CommentRequestDto requestDto) {
        Board board = getBoard(boardId);
        User user = getUser(userId);

        Comment comment = Comment.builder()
                .board(board)
                .user(user)
                .content(requestDto.getContent())
                .build();

        return toDto(commentRepository.save(comment));
    }

    @Transactional
    public CommentDto updateComment(Long commentId, Long userId, Long boardId, CommentRequestDto dto) {
        validateCommentOwner(commentId, userId, boardId);

        Comment comment = getComment(commentId);
        comment.setContent(dto.getContent());

        return toDto(comment);
    }

    @Transactional
    public void deleteComment(Long commentId, Long userId, Long boardId) {
        validateCommentOwner(commentId, userId, boardId);
        commentRepository.deleteById(commentId);
    }

    // =================== 헬퍼 메서드 ===================

    private void validateBoardExists(Long boardId) {
        if (!boardRepository.existsById(boardId)) {
            throw new IllegalArgumentException("존재하지 않는 게시글입니다. boardId: " + boardId);
        }
    }

    private void validateCommentOwner(Long commentId, Long userId, Long boardId) {
        if (!commentRepository.existsByIdAndUserIdAndBoardId(commentId, userId, boardId)) {
            throw new IllegalArgumentException("해당 댓글이 없거나 권한이 없습니다.");
        }
    }

    private Board getBoard(Long boardId) {
        return boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시글입니다. boardId: " + boardId));
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다. userId: " + userId));
    }

    private Comment getComment(Long commentId) {
        return commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 댓글입니다. commentId: " + commentId));
    }

    private CommentDto toDto(Comment comment) {
        return CommentDto.builder()
                .id(comment.getId())
                .userId(comment.getUser().getId())
                .boardId(comment.getBoard().getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }

}
