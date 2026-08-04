package com.bookportal.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request body for token refresh")
public record RefreshRequest(
    @Schema(description = "Refresh token", required = true)
    @NotBlank(message = "Refresh token is required")
    String refreshToken
) {
}
