package com.bookportal.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request body for user login")
public record LoginRequest(
    @Schema(description = "Username", example = "john_doe", required = true)
    @NotBlank(message = "Name is required")
    String name,

    @Schema(description = "Password", example = "securepassword123", required = true)
    @NotBlank(message = "Password is required")
    String password
) {
}
