package com.likelion.momentreeblog.domain.board.like.service;

import com.likelion.momentreeblog.domain.board.board.entity.Board;
import com.likelion.momentreeblog.domain.board.board.repository.BoardRepository;
import com.likelion.momentreeblog.domain.board.like.dto.BoardLikeInfoDto;
import com.likelion.momentreeblog.domain.board.like.entity.Like;
import com.likelion.momentreeblog.domain.board.like.repository.LikeRepository;
import com.likelion.momentreeblog.domain.user.user.dto.UserLikeDto;
import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.domain.user.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LikeService {
    private final LikeRepository likeRepository;
    private final BoardRepository boardRepository;
    private final UserRepository userRepository;
    @Transactional(readOnly = true)
    public BoardLikeInfoDto getBoardLikeInfo(Long boardId) {
        List<User> users = likeRepository.findUsersWhoLikedBoard(boardId);

        List<UserLikeDto> userDtos = users.stream()
                .map(user -> new UserLikeDto(user.getId(), user.getEmail()))
                .collect(Collectors.toList());

        return new BoardLikeInfoDto(userDtos, userDtos.size());
    }

    @Transactional
    public String likeBoard(Long userId, Long boardId) {
        System.out.println("userId: " + userId);
        System.out.println("boardId: " + boardId);
        // 이미 좋아요 눌렀는지 체크
        Optional<Like> optionalLike = likeRepository.findByUserIdAndBoardId(userId, boardId);

        if (optionalLike.isPresent()) {
            likeRepository.delete(optionalLike.get());
            return "좋아요 취소!";
        }

        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다."));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저가 존재하지 않습니다."));

        Like like = Like.builder()
                .board(board)
                .user(user)
                .build();

        likeRepository.save(like);
        return "좋아요 완료!";
    }
    @Transactional
    public String unlikeBoard(Long userId, Long boardId) {
        // 게시글을 조회하고, likes를 강제로 로딩
        Board board = boardRepository.findByIdWithLikes(boardId)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        // 좋아요를 찾고 삭제
        Like boardLike = likeRepository.findByUserIdAndBoardId(userId, boardId)
                .orElseThrow(() -> new IllegalArgumentException("좋아요가 존재하지 않습니다."));

        likeRepository.delete(boardLike);
        likeRepository.flush();

        // 게시글에서 해당 좋아요를 제거한 후 결과 반환
        return "좋아요 취소 성공";
    }
    @Transactional
    public Board getBoardWithLikes(Long boardId) {
        return boardRepository.findByIdWithLikes(boardId)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));
    }

}
