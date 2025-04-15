package com.likelion.momentreeblog.domain.user.user.service;

import com.likelion.momentreeblog.domain.blog.blog.entity.Blog;
import com.likelion.momentreeblog.domain.blog.blog.repository.BlogRepository;
import com.likelion.momentreeblog.domain.user.role.entity.Role;
import com.likelion.momentreeblog.domain.user.role.repository.RoleRepository;
import com.likelion.momentreeblog.domain.user.user.dto.UserSignupDto;
import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.domain.user.user.repository.UserRepository;
import com.likelion.momentreeblog.util.jwt.JwtTokenizer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final BlogRepository blogRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenizer jwtTokenizer;

    @Transactional
    public String saveUser(UserSignupDto dto){
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            return "이미 존재하는 이메일입니다!";
        }
        if (blogRepository.findByName(dto.getBlogName()).isPresent()) {
            return "이미 존재하는 블로그 이름입니다!";
        }

        // 이메일 형식 체크 추가
        if (!dto.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            return "이메일 형식이 올바르지 않습니다!";
        }

        // 비밀번호 길이 체크 추가
        if (dto.getPassword().length() < 8) {
            return "비밀번호는 최소 8자리 이상이어야 합니다!";
        }

        Set<Role> roles = new HashSet<>();
        roles.add(roleRepository.findById(2L).orElseThrow(() -> new IllegalArgumentException("Role이 존재하지 않습니다.")));

        // 2. User 객체 생성
        User user = User.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .roles(roles)
                .build();

        // 3. Blog 객체 생성
        Blog blog = Blog.builder()
                .name(dto.getBlogName())
                .viewCount(0L)
                .user(user)
                .build();

        user.setBlog(blog);
        String refreshToken = jwtTokenizer.createRefreshToken(
                user.getId(), // 아직 id가 없으므로 null (필요하다면 id 없이 생성하는 오버로드 만들 수도 있음)
                user.getEmail(),
               user.getName(),null
        );
        user.setRefreshToken(refreshToken);

        blogRepository.save(blog); // Blog 먼저 저장되면 blog_id 설정 가능
        userRepository.save(user);

        return "회원가입에 성공하셨습니다!! 저희 블로그의 회원이 되신 것을 축하드립니다!!";
    }

    @Transactional
    public User findUserByEmail(String email){
        return userRepository.findByEmail(email)
                .orElse(null); // 또는 예외 던지기
    }

    @Transactional
    public User findUserById(Long id){
        return userRepository.findById(id)
                .orElse(null);
    }

    @Transactional
    public User editUser(User user){
        return userRepository.save(user);
    }



}
