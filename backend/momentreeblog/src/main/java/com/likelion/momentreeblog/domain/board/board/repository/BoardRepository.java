package com.likelion.momentreeblog.domain.board.board.repository;

import com.likelion.momentreeblog.domain.board.board.entity.Board;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoardRepository extends JpaRepository<Board, Long>{
    Page<Board> findByContentContaining(String keyword, Pageable pageable);

}
