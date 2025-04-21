package com.likelion.momentreeblog.domain.photo.photo.entity;

import com.likelion.momentreeblog.domain.board.board.entity.Board;
//import com.likelion.momentreeblog.domain.photo.photo.photoenum.PhotoType;
import com.likelion.momentreeblog.domain.photo.photo.photoenum.PhotoType;
import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "photos")
public class Photo extends BaseEntity {

    @Enumerated(EnumType.STRING) //DB에 문자열 값으로 저장.
    @Column(name = "photo_type", nullable = false, length = 100)
    private PhotoType type; //PHOTO_TYPE: PROFILE, MAIN, ADDITIONAL

    @Column(nullable = false)
    private String url; // 사진주소

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "board_id")
    private Board board;


}