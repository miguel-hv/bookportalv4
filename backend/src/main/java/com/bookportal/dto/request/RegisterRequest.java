package com.bookportal.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Request body for user registration")
public record RegisterRequest(
    @Schema(description = "Username", example = "john_doe", required = true)
    @NotBlank(message = "Name is required")
    @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "Username must contain only letters and numbers")
    @Size(max = 50, message = "Name must not exceed 50 characters")
    String name,

    @Schema(description = "Password", example = "securepassword123", required = true)
    @NotBlank(message = "Password is required")
    String password
) {
}
