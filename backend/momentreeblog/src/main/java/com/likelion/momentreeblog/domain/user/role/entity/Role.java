package com.likelion.momentreeblog.domain.user.role.entity;

public enum Role {
    USER, ADMIN;

    public String getName() {
        return "ROLE_" + this.name();
    }
}