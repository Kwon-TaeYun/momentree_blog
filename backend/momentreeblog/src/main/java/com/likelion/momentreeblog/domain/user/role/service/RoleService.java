package com.likelion.momentreeblog.domain.user.role.service;

import com.likelion.momentreeblog.domain.user.role.entity.Role;
import com.likelion.momentreeblog.domain.user.role.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RoleService {
    private final RoleRepository roleRepository;
    @Transactional
    public Role addRole(Role role){
        Optional<Role> existingRole = roleRepository.findByName(role.getName());
        if (existingRole.isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 역할입니다: " + role.getName());
        }

        return roleRepository.save(role);
    }

}
