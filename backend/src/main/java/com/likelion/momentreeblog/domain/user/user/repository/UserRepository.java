package com.likelion.momentreeblog.domain.user.user.repository;

import com.likelion.momentreeblog.domain.user.user.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByName(String name);
    Optional<User> findByNameAndEmail(String name, String email);

    @Query("SELECT u FROM User u JOIN u.blog b ORDER BY b.viewCount DESC, u.createdAt DESC")
    List<User> findTop5ByOrderByViewCountDescCreatedAtDesc(Pageable pageable);
}

