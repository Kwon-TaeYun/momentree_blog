package com.likelion.momentreeblog.domain.user.role.controller;

import com.likelion.momentreeblog.domain.user.role.entity.Role;
import com.likelion.momentreeblog.domain.user.role.repository.RoleRepository;
import com.likelion.momentreeblog.domain.user.role.service.RoleService;
import com.likelion.momentreeblog.domain.user.user.service.UserService;
import com.likelion.momentreeblog.global.util.jwt.JwtTokenizer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/admin/api/v1")
@Slf4j
public class RoleApiV1Controller {
    private final RoleService roleService;
    private final UserService userService;
    private final JwtTokenizer jwtTokenizer;
    @PostMapping("/role/add")
    public ResponseEntity<?> addRole(@RequestBody Role role, @RequestHeader(value = "Authorization") String authorization){
        try {
            Long userId = jwtTokenizer.getUserIdFromToken(authorization);
            if(userService.findUserById(userId).getRoles().contains("ROLE_AMIN")) {
                return ResponseEntity.ok(roleService.addRole(role));
            }else{
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("권한이 없습니다.");
            }
        } catch (IllegalArgumentException e) {
            // 역할 중복 시
            log.info(e.getMessage());
            return ResponseEntity.ok(e.getMessage());
        } catch (Exception e) {
            // 기타 오류
            log.info(e.getMessage());
            return ResponseEntity.ok("서버 오류가 발생하였습니다.");
        }
    }

}
