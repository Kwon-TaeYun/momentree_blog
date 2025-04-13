package com.likelion.momentreeblog.domain.board.like.repository;

import com.likelion.momentreeblog.domain.board.like.entity.Like;
import com.likelion.momentreeblog.domain.user.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LikeRepository extends JpaRepository<Like, Long> {
    @Query("SELECT l.user FROM Like l WHERE l.board.id = :boardId")
    List<User> findUsersWhoLikedBoard(@Param("boardId") Long boardId);

    boolean existsByUserIdAndBoardId(Long userId, Long boardId);

}
