package com.bookportal.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request body for user logout")
public record LogoutRequest(
    @Schema(description = "Refresh token to invalidate", required = true)
    @NotBlank(message = "Refresh token is required")
    String refreshToken
) {
}
