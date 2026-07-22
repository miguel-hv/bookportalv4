package com.bookportal.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request body for user logout")
public record LogoutRequest(
    @Schema(description = "Refresh token to invalidate", required = true) String refreshToken
) {
}
