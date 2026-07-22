package com.bookportal.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Error response")
public record ErrorResponse(
    @Schema(description = "Error type", example = "VALIDATION_ERROR") String error,
    @Schema(description = "Error message", example = "Invalid input data") String message
) {
}
