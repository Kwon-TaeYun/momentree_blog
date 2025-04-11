package com.likelion.momentreeblog.domain.user.role.service;

import com.likelion.momentreeblog.domain.user.role.entity.Role;
import com.likelion.momentreeblog.domain.user.role.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RoleService {
    private final RoleRepository roleRepository;
    @Transactional
    public Role addRole(Role role){
        return roleRepository.save(role);
    }

}
