package com.likelion.momentreeblog.domain.user.user.repository;

import com.likelion.momentreeblog.domain.user.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserFindRepository extends JpaRepository<User, Long> {
    Optional<User> findById(String id);
    Optional<User> findByName(String name);
    Optional<User> findByEmail(String email);
}
