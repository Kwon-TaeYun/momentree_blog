package com.likelion.momentreeblog.domain.user.user.service;

import com.likelion.momentreeblog.domain.blog.blog.entity.Blog;
import com.likelion.momentreeblog.domain.blog.blog.repository.BlogRepository;
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

import java.util.Optional;

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

        User user = User.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(roleRepository.findById(1L).get())
                .build();

        Blog blog = Blog.builder()
                .name(dto.getBlogName())
                .viewCount(0L)
                .user(user)
                .build();



        user.setBlog(blog);
        String refreshToken = jwtTokenizer.createRefreshToken(
                user.getId(), // 아직 id가 없으므로 null (필요하다면 id 없이 생성하는 오버로드 만들 수도 있음)
                user.getEmail(),
                user.getName(), // or username
                user.getRole().getName()
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
    public User editUser(User user){
        return userRepository.save(user);
    }

}
