package com.bookportal.dto.response;

import com.bookportal.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(description = "User information response")
public record UserResponse(
    @Schema(description = "User ID") Long id,
    @Schema(description = "Username", example = "john_doe") String name,
    @Schema(description = "Account creation timestamp") Instant createdAt
) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getCreatedAt());
    }
}
