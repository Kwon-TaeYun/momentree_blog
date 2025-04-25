package com.likelion.momentreeblog.domain.user.user.dto;

import com.likelion.momentreeblog.domain.user.user.entity.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserResponse {
    private Long id; // 아이디
    private String name; // 이름
    private String email; // 이메일
    private Long blogViewCount;
    private String blogName;
    
    private Long blogId; // <-- 해당 유저의 블로그 ID
    private String profileImage; // <-- 프로필 이미지 URL 필드 추가

    // public static UserResponse from(User user) {
    //     return UserResponse.builder()
    //             .id(user.getId())
    //             .name(user.getName())
    //             .email(user.getEmail())
    //             .blogViewCount(user.getBlog().getViewCount())
    //             .blogName(user.getBlog().getName())
    //             .build();
    // }

    private String profilePhotoUrl;
    private String profilePhotoKey;


    public static UserResponse from(User user) {
        // user.getBlog() 호출 시 NullPointerException 방지
        Long blogId = null;
        Long blogViewCount = 0L; // 블로그가 없을 경우 기본값
        String blogName = null; // 블로그가 없을 경우 기본값

        if (user.getBlog() != null) {
            blogId = user.getBlog().getId(); // Blog 엔티티의 ID 가져옴
            blogViewCount = user.getBlog().getViewCount(); // 블로그 조회수 가져옴
            blogName = user.getBlog().getName(); // 블로그 이름 가져옴
        }

        // 프로필 이미지 URL 가져오기 (User 엔티티에 currentProfilePhoto 필드가 있다면)
        // user.getCurrentProfilePhoto() 호출 시 NullPointerException 방지
        String profileImageUrl = null;
        if (user.getCurrentProfilePhoto() != null) {
             profileImageUrl = user.getCurrentProfilePhoto().getUrl();
        }


        // TODO: 만약 UserResponse에 팔로워/팔로잉 수가 필요하다면,
        // UserService의 getTop5Bloggers 메소드에서 이 정보를 조회하여 DTO에 설정해야 합니다.
        // 여기서는 User 엔티티 자체의 필드만 사용합니다.
        // int followerCount = 0; // 예시 (필요시 추가)


        return UserResponse.builder()
                .id(user.getId()) // 유저 ID 설정
                .name(user.getName()) // 유저 이름 설정
                .email(user.getEmail()) // 유저 이메일 설정

                // --- profileImage 필드 설정 ---
                .profileImage(profileImageUrl) // <-- 프로필 이미지 URL 설정

                .blogViewCount(blogViewCount) // 블로그 조회수 설정 (null 체크 반영)
                .blogName(blogName) // 블로그 이름 설정 (null 체크 반영)

                // --- blogId 필드 설정 ---
                .blogId(blogId) // <-- 블로그 ID 설정

                // .followerCount(...) // 팔로워 수 설정 (필요시)
                .build();
    }
}