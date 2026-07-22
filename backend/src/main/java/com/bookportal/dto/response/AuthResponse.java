package com.bookportal.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Authentication response containing JWT tokens")
public record AuthResponse(
        @Schema(description = "JWT access token") String accessToken,
        @Schema(description = "JWT refresh token") String refreshToken,
        @Schema(description = "Token expiration time in milliseconds") long expiresIn,
        @Schema(description = "Authenticated user information") UserResponse user
) {
}
