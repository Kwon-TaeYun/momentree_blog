package com.likelion.momentreeblog.domain.user.user.service;

import com.likelion.momentreeblog.domain.blog.blog.entity.Blog;
import com.likelion.momentreeblog.domain.blog.blog.repository.BlogRepository;
import com.likelion.momentreeblog.domain.photo.photo.entity.Photo;
import com.likelion.momentreeblog.domain.photo.photo.repository.PhotoRepository;
import com.likelion.momentreeblog.domain.s3.service.S3V1Service;
import com.likelion.momentreeblog.domain.user.role.entity.Role;
import com.likelion.momentreeblog.domain.user.user.dto.UserDeleteRequest;
import com.likelion.momentreeblog.domain.user.user.dto.UserResponse;
import com.likelion.momentreeblog.domain.user.user.dto.UserSignupDto;
import com.likelion.momentreeblog.domain.user.user.dto.UserUpdateDto;
import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.domain.user.user.repository.UserRepository;
import com.likelion.momentreeblog.domain.user.user.userenum.UserStatus;
import com.likelion.momentreeblog.global.util.jwt.JwtTokenizer;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
    //    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenizer jwtTokenizer;
    private final AuthTokenService authTokenService;
    private final S3V1Service s3V1Service;
    private final PhotoRepository photoRepository;


    @Value("${custom.default-image.url}")
    private String DEFAULT_IMAGE_URL;





    @Transactional
    public String saveUser(UserSignupDto dto) {
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
        roles.add(Role.USER);

        // 2. User 객체 생성
        User user = User.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .status(UserStatus.ACTIVE)
                .roles(Set.of(Role.USER))
                .status(UserStatus.ACTIVE)
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
                user.getName(), null
        );
        user.setRefreshToken(refreshToken);

        blogRepository.save(blog); // Blog 먼저 저장되면 blog_id 설정 가능
        userRepository.save(user);

        return "회원가입에 성공하셨습니다!! 저희 블로그의 회원이 되신 것을 축하드립니다!!";
    }

    @Transactional
    public User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElse(null); // 또는 예외 던지기
    }

    @Transactional
    public User findUserById(Long id) {
        return userRepository.findById(id)
                .orElse(null);
    }

    public Optional<User> findByName(String username) {
        return userRepository.findByName(username);
    }

    @Transactional
    public User editUser(User user) {
        return userRepository.save(user);
    }


//    @Transactional
//    public void changeUserStatusDeleted(Long id, UserDeleteRequest request) {
//        User user = userRepository.findById(id)
//                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다. id=" + id));
//
//        if (!request.getEmail().equals(user.getEmail())) {
//            throw new IllegalArgumentException("이메일이 일치 하지 않습니다. 이매일을 다시 입력해주세요");
//        }
//
//        user.setStatus(UserStatus.DELETED);
//        userRepository.save(user);
//    }



    public User getMemberFromAccessToken(String accessToken) {
        Map<String, Object> payload = authTokenService.payload(accessToken);

        if (payload == null) return null;

        Long id = ((Number) payload.get("id")).longValue();

        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다. id=" + id));

    }

    @Transactional
    public List<UserResponse> getTop5Bloggers() {
        List<User> topUsers = userRepository.findTop5ByOrderByViewCountDescCreatedAtDesc((Pageable) PageRequest.of(0, 5));
        return topUsers.stream()
                .map(user -> {
                    Photo currentProfilePhoto = user.getCurrentProfilePhoto();
                    String key = (currentProfilePhoto != null) ? currentProfilePhoto.getUrl() : DEFAULT_IMAGE_URL;
                    String url = s3V1Service.generateGetPresignedUrl(key).getPublicUrl();


                    return UserResponse.builder()
                            .id(user.getId())
                            .name(user.getName())
                            .email(user.getEmail())
                            .blogViewCount(user.getBlog().getViewCount())
                            .blogName(user.getBlog().getName())
                            .profilePhotoKey(key)
                            .profilePhotoUrl(url)
                            .blogId(user.getBlog().getId())
                            .build();
                })
                .toList();
    }


    @Transactional
    public void updateUser(Long userId, UserUpdateDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));

        // blogName → Blog 조회해서 설정
        if (dto.getBlogName() != null) {
            Blog blog = blogRepository.findByName(dto.getBlogName())
                    .orElseThrow(() -> new RuntimeException("해당 이름의 블로그를 찾을 수 없습니다."));
            user.setBlog(blog);
        }

        // 프로필 사진
        if (dto.getCurrentProfilePhoto() != null) {
            Long photoId = dto.getCurrentProfilePhoto().getId();
            Photo profilePhoto = photoRepository.findById(photoId)
                    .orElseThrow(() -> new RuntimeException("프로필 사진을 찾을 수 없습니다."));
            user.setCurrentProfilePhoto(profilePhoto);
        }
    }



    @Transactional
    public void changeUserStatusDeleted(Long id, UserDeleteRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다. id=" + id));

        if (!request.getEmail().equals(user.getEmail())) {
            throw new IllegalArgumentException("이메일이 일치 하지 않습니다. 이매일을 다시 입력해주세요");
        }

        user.setStatus(UserStatus.DELETED);
    }



    public String genAccessToken(User member) {
        return authTokenService.genAccessToken(member);
    }

//    public User join_temp(String name, String email, String provider) {
//        // 중복 사용자 체크
//        userRepository.findByName(name).ifPresent(member -> {
//            throw new RuntimeException("해당 username은 이미 사용중입니다.");
//        });
//
//        // Role 조회
//        Optional<Role> role = roleRepository.findById(2L);
//
//        // User 생성
//        User member = User.builder()
//                .name(name)
//                .password(UUID.randomUUID().toString())
//                .email(email)
//                .refreshToken(UUID.randomUUID().toString())
//                .oauth2Provider(provider)
//                .roles(role.stream().toList())
//                .build();
//
//        // Blog 생성 및 양방향 관계 설정
//        Blog blog = Blog.builder()
//                .name(name + "의 블로그")
//                .build();
//
//        member.setBlog(blog); // 이 한 줄로 양방향 모두 설정됨 (위에서 편의 메서드 작성했다면)
//
//        // user 저장 (cascade = ALL이므로 blog도 함께 저장됨)
//        return userRepository.save(member);
//    }

    public User join(String name, String email, String provider) {
        try {
            log.info("OAuth2 회원가입 처리 시작 - email: {}, name: {}, provider: {}", email, name, provider);
            
            // 중복 사용자 체크
            userRepository.findByName(name).ifPresent(member -> {
                log.warn("OAuth2 회원가입 실패 - 이미 존재하는 사용자명: {}", name);
                throw new RuntimeException("해당 username은 이미 사용중입니다.");
            });

            // Set 생성 및 Role 추가
            Set<Role> userRoles = new HashSet<>();
            userRoles.add(Role.USER);

            // User 생성 - 필수 필드 초기화 확인
            User member = User.builder()
                    .name(name)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .email(email)
                    .refreshToken(UUID.randomUUID().toString())
                    .oauth2Provider(provider)
                    .roles(userRoles)
                    .status(UserStatus.ACTIVE)
                    .build();

            log.info("user의 role :: " + member.getRoles().toString());

            // Blog 생성 및 양방향 관계 설정
            Blog blog = Blog.builder()
                    .name(name + "의 블로그")
                    .viewCount(0L)
                    .build();

            member.setBlog(blog); // 양방향 관계 설정
            blog.setUser(member); // 양방향 관계 명시적 설정

            // user 저장 (cascade = ALL이므로 blog도 함께 저장됨)
            User savedUser = userRepository.save(member);
            log.info("OAuth2 회원가입 성공 - userId: {}, email: {}", savedUser.getId(), savedUser.getEmail());
            
            return savedUser;
        } catch (Exception e) {
            log.error("OAuth2 회원가입 처리 중 오류 발생", e);
            throw e;
        }
    }





    public void modify(User member, @NotBlank String nickname) {
        member.setEmail(nickname);
    }

    public User modifyOrJoin(String username, String nickname, String provider) {
        try {
            log.info("OAuth2 사용자 처리 시작 - 이름: {}, 이메일: {}, 제공자: {}", username, nickname, provider);
            
            Optional<User> opMember = findByName(username);

            if (opMember.isPresent()) {
                User member = opMember.get();
                log.info("기존 OAuth2 사용자 발견 - userId: {}, 이름: {}", member.getId(), member.getName());
                modify(member, nickname);
                log.info("기존 OAuth2 사용자 정보 업데이트 완료");
                return member;
            }

            log.info("신규 OAuth2 사용자 등록 시작");
            return join(username, nickname, provider);
        } catch (Exception e) {
            log.error("OAuth2 사용자 처리 중 오류 발생", e);
            throw e;
        }
    }


    public Optional<User> findById(Long id){
        Optional<User> user = userRepository.findById(id);
        return user;
    }




}
