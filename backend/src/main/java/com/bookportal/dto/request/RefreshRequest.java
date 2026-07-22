package com.bookportal.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request body for token refresh")
public record RefreshRequest(
    @Schema(description = "Refresh token", required = true) String refreshToken
) {
}
