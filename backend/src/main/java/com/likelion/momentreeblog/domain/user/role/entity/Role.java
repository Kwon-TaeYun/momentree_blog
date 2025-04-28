package com.likelion.momentreeblog.domain.user.role.entity;

import jakarta.persistence.Entity;

public enum Role {
    USER, ADMIN;

    public String getName() {
        return "ROLE_" + this.name();
    }
}