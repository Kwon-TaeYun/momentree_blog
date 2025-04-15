package com.likelion.momentreeblog.domain.user.role.controller;

import com.likelion.momentreeblog.domain.user.role.entity.Role;
import com.likelion.momentreeblog.domain.user.role.repository.RoleRepository;
import com.likelion.momentreeblog.domain.user.role.service.RoleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/admin/api/v1")
@Slf4j
public class RoleApiV1Controller {
    private final RoleService roleService;
    @PostMapping("/role/add")
    public ResponseEntity addRole(@RequestBody Role role){
        try{
            return ResponseEntity.ok(roleService.addRole(role));
        }catch (Exception e){
            log.info(e.getMessage());
            return ResponseEntity.internalServerError().body("서버 오류가 발생하였습니다.");
        }
    }
}
