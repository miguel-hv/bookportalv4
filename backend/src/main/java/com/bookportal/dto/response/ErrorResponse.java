package com.bookportal.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(description = "Error response")
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
    @Schema(description = "Error type", example = "VALIDATION_ERROR") String error,
    @Schema(description = "Human-readable message", example = "Invalid input data") String message,
    @Schema(description = "Error code for programmatic handling", example = "ERR_VALIDATION") String errorCode,
    @Schema(description = "Timestamp of the error", example = "2026-07-23T10:30:00Z") Instant timestamp,
    @Schema(description = "Request path that caused the error", example = "/api/reviews") String path
) {
    public ErrorResponse(String error, String message) {
        this(error, message, null, Instant.now(), null);
    }

    public ErrorResponse(String error, String message, String errorCode) {
        this(error, message, errorCode, Instant.now(), null);
    }

    public ErrorResponse withPath(String path) {
        return new ErrorResponse(error, message, errorCode, timestamp, path);
    }
}
