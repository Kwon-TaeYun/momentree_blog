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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
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
        // 이미 좋아요 눌렀는지 체크
        boolean exists = likeRepository.existsByUserIdAndBoardId(userId, boardId);
        if (exists) {
            return "이미 좋아요를 눌렀습니다.";
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
}
