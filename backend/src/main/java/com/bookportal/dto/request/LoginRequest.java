package com.bookportal.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request body for user login")
public record LoginRequest(
    @Schema(description = "Username", example = "john_doe", required = true) String name,
    @Schema(description = "Password", example = "securepassword123", required = true) String password
) {
}
