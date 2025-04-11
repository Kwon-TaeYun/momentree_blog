package com.likelion.momentreeblog.domain.user.role.repository;

import com.likelion.momentreeblog.domain.user.role.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findById(Long id);
}
