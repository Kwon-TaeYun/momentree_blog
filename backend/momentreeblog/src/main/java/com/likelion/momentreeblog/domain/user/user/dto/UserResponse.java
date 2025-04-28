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
    
    private Long blogId; 
    private String profileImage; 

    public static UserResponse from(User user) {
        Long blogId = null;
        Long blogViewCount = 0L; 
        String blogName = null;

        if (user.getBlog() != null) {
            blogId = user.getBlog().getId();
            blogViewCount = user.getBlog().getViewCount(); 
            blogName = user.getBlog().getName(); 
        }

        String profileImageUrl = null;
        if (user.getCurrentProfilePhoto() != null) {
             profileImageUrl = user.getCurrentProfilePhoto().getUrl();
        }

        return UserResponse.builder()
                .id(user.getId()) 
                .name(user.getName()) 
                .email(user.getEmail())
                .profileImage(profileImageUrl)
                .blogViewCount(blogViewCount) 
                .blogName(blogName) 
                .blogId(blogId) 
                .build();
    }
}