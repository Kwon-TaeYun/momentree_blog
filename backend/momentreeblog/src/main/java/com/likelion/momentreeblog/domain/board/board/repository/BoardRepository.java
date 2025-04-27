package com.likelion.momentreeblog.domain.board.board.repository;

import com.likelion.momentreeblog.domain.blog.blog.entity.Blog;
import com.likelion.momentreeblog.domain.board.board.dto.BoardListResponseDto;
import com.likelion.momentreeblog.domain.board.board.entity.Board;
import com.likelion.momentreeblog.domain.board.category.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BoardRepository extends JpaRepository<Board, Long>{
    Page<Board> findByContentContaining(String keyword, Pageable pageable);

    // 사용자 ID로 게시물 조회
    List<Board> findByBlog_User_Id(Long userId);

    // 페이징 처리용 사용자 ID로 게시글 조회
    Page<Board> findByBlog_User_Id(Long userId, Pageable pageable);
    @Query("SELECT b FROM Board b LEFT JOIN FETCH b.likes ORDER BY b.createdAt DESC")
    List<Board> findTopBoards(Pageable pageable);

    @Query("""
    SELECT b FROM Board b
    LEFT JOIN b.likes l
    GROUP BY b.id
    ORDER BY COUNT(l) DESC, MAX(b.createdAt) DESC
""")
    List<Board> findTop5ByLikeCount(Pageable pageable);
    boolean existsByCategory(Category category);

    // BoardRepository 인터페이스에 추가
    Page<Board> findByBlogId(Long blogId, Pageable pageable);
    @Query("SELECT b FROM Board b LEFT JOIN FETCH b.likes WHERE b.id = :boardId")
    Optional<Board> findByIdWithLikes(@Param("boardId") Long boardId);
}
