package com.likelion.momentreeblog.domain.board.category.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@Table(name = "category")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@ToString
public class Category extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @OneToMany(mappedBy = "category",orphanRemoval = true)
    private List<Board> boards;

}
