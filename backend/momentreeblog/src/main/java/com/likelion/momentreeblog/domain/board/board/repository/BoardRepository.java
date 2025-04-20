package com.likelion.momentreeblog.domain.board.board.repository;

import com.likelion.momentreeblog.domain.blog.blog.entity.Blog;
import com.likelion.momentreeblog.domain.board.board.entity.Board;
import com.likelion.momentreeblog.domain.board.category.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BoardRepository extends JpaRepository<Board, Long>{
    Page<Board> findByContentContaining(String keyword, Pageable pageable);

    // 사용자 ID로 게시물 조회
    List<Board> findByBlog_User_Id(Long userId);

    // 페이징 처리용 사용자 ID로 게시글 조회
    Page<Board> findByBlog_User_Id(Long userId, Pageable pageable);

}
