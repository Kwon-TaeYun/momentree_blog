package com.likelion.momentreeblog.domain.board.like.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.likelion.momentreeblog.domain.board.board.entity.Board;
import com.likelion.momentreeblog.domain.user.user.entity.User;
import com.likelion.momentreeblog.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;
import org.hibernate.mapping.ToOne;

@Entity
@Table(name = "likes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "board_id"})
})
@Getter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@ToString
public class Like extends BaseEntity
{
    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;

    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

}
