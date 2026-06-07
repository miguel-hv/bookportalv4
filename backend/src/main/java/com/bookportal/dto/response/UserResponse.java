package com.bookportal.dto.response;

import com.bookportal.entity.User;

import java.time.Instant;

public record UserResponse(Long id, String name, Instant createdAt) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getCreatedAt());
    }
}
