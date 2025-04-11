package com.likelion.momentreeblog.domain.board.board.service;

import com.likelion.momentreeblog.domain.blog.blog.entity.Blog;
import com.likelion.momentreeblog.domain.blog.blog.repository.BlogRepository;
import com.likelion.momentreeblog.domain.board.board.dto.BoardListResponseDto;
import com.likelion.momentreeblog.domain.board.board.dto.BoardRequestDto;
import com.likelion.momentreeblog.domain.board.board.entity.Board;
import com.likelion.momentreeblog.domain.board.board.repository.BoardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardService {
    private final BoardRepository boardRepository;
    private final BlogRepository blogRepository;

    //게시글 작성
    @Transactional
    public String createBoard(BoardRequestDto requestDto) {
        Blog blog = blogRepository.findById(requestDto.getBlogId()).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 블로그"));

        Board board = new Board();
        board.setTitle(requestDto.getTitle());
        board.setContent(requestDto.getContent());
        board.setMainPhotoId(requestDto.getMainPhotoId());
        board.setPhotoSavedUrl(requestDto.getPhotoSavedUrl());
        board.setBlog(blog);

        Board savedBoard = boardRepository.save(board);

        return "게시글 작성 완료(" +savedBoard.getTitle()+ ")";
    }


    //게시글 수정
    @Transactional
    public String updateBoard(Long id, BoardRequestDto requestDto) {
        Board board = boardRepository.findById(id).orElseThrow(()-> new IllegalArgumentException("존재하지 않는 게시물"));

        Blog blog = blogRepository.findById(requestDto.getBlogId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 블로그"));

        board.setTitle(requestDto.getTitle());
        board.setContent(requestDto.getContent());
        board.setMainPhotoId(requestDto.getMainPhotoId());
        board.setPhotoSavedUrl(requestDto.getPhotoSavedUrl());
        board.setBlog(blog);

        Board updatedBoard = boardRepository.save(board);

        return "게시글 수정 완료 (" + updatedBoard.getTitle() + ")";

    }

    //게시글 삭제
    @Transactional
    public String deleteBoard(Long id) {
        if (boardRepository.existsById(id)) {
            throw new IllegalArgumentException("존재하지 않는 게시물");
        }
        boardRepository.deleteById(id);

        return "게시글 삭제 완료";
    }

    //게시글 목록 조회 (타이틀과 블로그 ID만 반환)
    @Transactional
    public Page<BoardListResponseDto> getBoardList(Pageable pageable) {
        return boardRepository.findAll(pageable)
                .map(board -> new BoardListResponseDto(
                        board.getId(),
                        board.getTitle(),
                        board.getBlog().getId()
                ));
    }



}
