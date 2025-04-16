package com.likelion.momentreeblog.domain.board.board.service;

import com.likelion.momentreeblog.domain.blog.blog.entity.Blog;
import com.likelion.momentreeblog.domain.blog.blog.repository.BlogRepository;
import com.likelion.momentreeblog.domain.board.board.dto.BoardListResponseDto;
import com.likelion.momentreeblog.domain.board.board.dto.BoardRequestDto;
import com.likelion.momentreeblog.domain.board.board.entity.Board;
import com.likelion.momentreeblog.domain.board.board.repository.BoardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardService {
    private final BoardRepository boardRepository;
    private final BlogRepository blogRepository;
//    public boolean checkUserIsBlogOwner(Long userId, Long blogId) {
//        Blog blog = blogRepository.findById(blogId)
//                .orElseThrow(() -> new RuntimeException("블로그를 찾을 수 없습니다."));
//
//        return blog.getUser().getId().equals(userId);
//    }
    //게시글 작성
    @Transactional
    public String createBoard(BoardRequestDto requestDto, Long userId) {
        Blog blog = blogRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("블로그를 찾을 수 없습니다."));

        Board board = new Board(requestDto, blog); // 생성자 수정 필요
        Board savedBoard = boardRepository.save(board);

        return "게시글 작성 완료(" + savedBoard.getTitle() + ")";
    }


    //게시글 수정
    @Transactional
    public String updateBoard(Long id, Long userId, BoardRequestDto requestDto) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시물"));

        Blog blog = blogRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저의 블로그가 존재하지 않습니다."));

        // 게시글의 주인인지 확인
        if (!board.getBlog().getId().equals(blog.getId())) {
            throw new SecurityException("게시글 수정 권한이 없습니다.");
        }

        board.setTitle(requestDto.getTitle());
        board.setContent(requestDto.getContent());
        board.setCurrentMainPhoto(requestDto.getCurrentMainPhoto());
        board.setPhotos(requestDto.getPhotos());

        Board updatedBoard = boardRepository.save(board);
        return "게시글 수정 완료 (" + updatedBoard.getTitle() + ")";
    }

    @Transactional
    public String deleteBoard(Long id, Long userId) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시물"));

        Blog blog = blogRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저의 블로그가 존재하지 않습니다."));

        // 게시글의 주인인지 확인
        if (!board.getBlog().getId().equals(blog.getId())) {
            throw new SecurityException("게시글 삭제 권한이 없습니다.");
        }

        boardRepository.delete(board);
        return "게시글 삭제 완료";
    }


    //게시글 목록 조회 (타이틀과 블로그 ID만 반환)
    @Transactional
    public Page<BoardListResponseDto> getBoardList() {
        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        return boardRepository.findAll(pageable)
                .map(board -> new BoardListResponseDto(
                        board.getId(),
                        board.getTitle(),
                        board.getBlog().getId()
                ));
    }

    @Transactional(readOnly = true)
    public Page<BoardListResponseDto> searchBoardsByContent(String keyword) {
        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Board> findBoard = boardRepository.findByContentContaining(keyword, pageable);

        return findBoard.map(board -> new BoardListResponseDto(
                board.getId(),
                board.getTitle(),
                board.getBlog().getId()
        ));
    }








}
