package com.likelion.momentreeblog.domain.user.user.repository;

import com.likelion.momentreeblog.domain.user.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
