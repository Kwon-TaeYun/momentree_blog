package com.likelion.momentreeblog.domain.user.user.service;

import com.likelion.momentreeblog.domain.blog.blog.entity.Blog;
import com.likelion.momentreeblog.domain.blog.blog.repository.BlogRepository;
import com.likelion.momentreeblog.domain.user.role.entity.Role;
import com.likelion.momentreeblog.domain.user.role.repository.RoleRepository;
import com.likelion.momentreeblog.domain.user.user.dto.UserSignupDto;
import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.domain.user.user.repository.UserRepository;
import com.likelion.momentreeblog.global.util.jwt.JwtTokenizer;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final BlogRepository blogRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenizer jwtTokenizer;
    private final AuthTokenService authTokenService;

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

        List<Role> roles = new ArrayList<>();
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

    public Optional<User> findByName(String username) {
        return userRepository.findByName(username);
    }

    @Transactional
    public User editUser(User user){
        return userRepository.save(user);
    }

    public User getMemberFromAccessToken(String accessToken) {
        Map<String, Object> payload = authTokenService.payload(accessToken);

        if (payload == null) return null;

        Long id = ((Number) payload.get("id")).longValue();

        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다. id=" + id));

    }

    public String genAccessToken(User member) {
        return authTokenService.genAccessToken(member);
    }

    public User join(String name, String email, String provider) {
        // 이미 존재하는 사용자인지 체크
        userRepository
                .findByEmail(email)
                .ifPresent(user -> {
                    throw new RuntimeException("해당 이메일은 이미 사용중입니다.");
                });

        // 기본 Role 조회
        Role userRole = roleRepository.findById(2L)
                .orElseThrow(() -> new RuntimeException("ROLE_USER가 DB에 존재하지 않습니다."));

        // Blog 객체 자동 생성
        Blog newBlog = Blog.builder()
                .name(name + "'s Blog")
                .build();

        // User 객체 임시 생성 (refreshToken 생성용 ID는 null 가능)
//        User user = User.builder()
//                .name(name)
//                .email(email)
//                .password("") // 소셜 로그인이라 비워둠
//                .oauth2Provider(provider)  // 올바르게 oauth2Provider에 값 설정
//                .roles(new ArrayList<>(Collections.singletonList(userRole)))
//                .blog(newBlog)
//                .build();
        User user = User.builder()
                .name(name)
                .email(email)
                .password("") // ❗ null 대신 빈 문자열
                .oauth2Provider(provider)
                .roles(new ArrayList<>(Collections.singletonList(userRole)))
                .blog(newBlog)
                .build();

        // refreshToken JWT로 생성
        String refreshToken = jwtTokenizer.createRefreshToken(
                null, // user.getId()는 아직 null이지만, 필요 없다면 null로 가능
                email,
                name,
                List.of(userRole.getName())
        );
        user.setRefreshToken(refreshToken);

        // Blog 저장 및 연결
        if (newBlog.getId() == null) {  // 만약 새로운 Blog라면 저장
            blogRepository.save(newBlog);
        }

        return userRepository.save(user);  // User 저장
    }




    public void modify(User member, @NotBlank String nickname) {
        member.setEmail(nickname);
    }

    public User modifyOrJoin(String username, String nickname, String provider) {
        Optional<User> opMember = findByName(username);

        if (opMember.isPresent()) {
            User member = opMember.get();
            modify(member, nickname);
            return member;
        }

        return join(username, nickname, provider);
    }


    public Optional<User> findById(Long id){
        Optional<User> user = userRepository.findById(id);
        return user;
    }




}
