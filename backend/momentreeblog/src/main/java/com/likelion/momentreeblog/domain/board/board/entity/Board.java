package com.likelion.momentreeblog.domain.board.board.entity;

import com.likelion.momentreeblog.global.jpa.BaseEntity;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@ToString
public class Board extends BaseEntity {
    private String title;
    private String content;

    //test 주석
}
