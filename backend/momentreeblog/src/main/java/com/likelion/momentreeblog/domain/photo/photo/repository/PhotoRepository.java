package com.likelion.momentreeblog.domain.photo.photo.repository;

import com.likelion.momentreeblog.domain.photo.photo.entity.Photo;
import com.likelion.momentreeblog.domain.photo.photo.photoenum.PhotoType;
import com.likelion.momentreeblog.domain.user.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PhotoRepository extends JpaRepository<Photo, Long> {

    //타입으로 프로필사진만 모아보기
    List<Photo> findByUser_IdAndType(Long userId, PhotoType type);

    //타입으로 게시글 사진 분류해서 모아보기
    List<Photo> findByBoard_IdAndType(Long boardId, PhotoType type);

    Long user(User user);

    List<Photo> findByBoardIdAndType(Long boardId, PhotoType type);

    Optional<Photo> findFirstByBoardIdAndTypeOrderByCreatedAtDesc(Long boardId, PhotoType type);

    List<Photo> findByUser_Id(Long userId);
}
