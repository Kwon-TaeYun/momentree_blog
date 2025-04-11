package com.likelion.momentreeblog.domain.user.user.repository;

import com.likelion.momentreeblog.domain.user.follower.entity.FollowManagement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FollowRepository extends JpaRepository<FollowManagement, Long> {
    // o1 : (T) - 관리할 Entity 클래스, o2 : (ID) - 해당 Entity의 기본키 타입
}
