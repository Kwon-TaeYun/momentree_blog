package com.likelion.momentreeblog.domain.user.user.repository;

import com.likelion.momentreeblog.domain.user.follower.entity.FollowManagement;
import com.likelion.momentreeblog.domain.user.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<FollowManagement, Long> {
    // o1 : (T) - 관리할 Entity 클래스, o2 : (ID) - 해당 Entity의 기본키 타입

    // 팔로우 관계 확인
    Optional<FollowManagement> findByFollowerAndFollowing(User follower, User following);

    // 특정 유저 팔로잉 수
    Long countByFollower(User follower);

    // 특정 유저의 팔로워 수
    Long countByFollowing(User following);

    // 팔로우 목록 조회
    List<FollowManagement> findAllByFollower(User follower);

    // 언팔로우 (삭제 메소드)
    void deleteByFollowerAndFollowing(User follower, User following);
}
