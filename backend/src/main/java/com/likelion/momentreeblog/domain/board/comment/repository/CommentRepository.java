package com.likelion.momentreeblog.domain.board.comment.repository;

import com.likelion.momentreeblog.domain.board.comment.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    //페이징 기술을 사용하는데 boardId가 같은 애들만 페이징기술 적용
    Page<Comment> findByBoardIdOrderByCreatedAtDesc(Long boardId, Pageable pageable);

    //수정, 삭제시 검증하기 위한 메서드
    boolean existsByIdAndUserIdAndBoardId(Long commentId, Long userId, Long boardId);
}
