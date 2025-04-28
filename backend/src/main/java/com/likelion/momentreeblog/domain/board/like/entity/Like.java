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

import java.util.Objects;

@Entity
@Table(name = "likes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "board_id"})
})
@Getter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Like extends BaseEntity
{
    @ManyToOne
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Like like = (Like) o;
        return Objects.equals(getId(), like.getId()) &&
                Objects.equals(user.getId(), like.getUser().getId()) &&
                Objects.equals(board.getId(), like.getBoard().getId());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getId(), user.getId(), board.getId());
    }

}
