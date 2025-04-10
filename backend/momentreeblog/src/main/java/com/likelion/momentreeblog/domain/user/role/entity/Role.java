package com.likelion.momentreeblog.domain.user.role.entity;


import com.likelion.momentreeblog.global.jpa.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "roles")
public class Role extends BaseEntity {

    @Column(name = "role_name", nullable = false)
    private String role;
}
