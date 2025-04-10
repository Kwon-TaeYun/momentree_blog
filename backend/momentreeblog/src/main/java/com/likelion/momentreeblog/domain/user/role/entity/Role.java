package com.likelion.momentreeblog.domain.user.role.entity;


import com.likelion.momentreeblog.global.jpa.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "roles")
@SuperBuilder
@ToString
public class Role extends BaseEntity {

    @Column( nullable = false)
    private String name;
}
