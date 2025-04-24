package com.likelion.momentreeblog.domain.user.user.repository;

import com.likelion.momentreeblog.domain.user.follower.entity.FollowManagement;
import com.likelion.momentreeblog.domain.user.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    // 언팔로우 (삭제 메소드)
    void deleteByFollowerAndFollowing(User follower, User following);

    // followerId로 검색 (내가 팔로우하는 사람들)
    @Query("SELECT fm FROM FollowManagement fm WHERE fm.follower.id = :followerId")
    List<FollowManagement> findAllByFollowerId(@Param("followerId") Long followerId);

    // followingId로 검색 (나를 팔로우하는 사람들)
    @Query("SELECT fm FROM FollowManagement fm WHERE fm.following.id = :followingId")
    List<FollowManagement> findAllByFollowingId(@Param("followingId") Long followingId);
}
