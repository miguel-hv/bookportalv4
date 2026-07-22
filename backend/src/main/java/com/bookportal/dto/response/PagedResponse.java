package com.bookportal.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Paginated response wrapper")
public record PagedResponse<T>(
        @Schema(description = "List of items") List<T> content,
        @Schema(description = "Current page number (0-indexed)", example = "0") int page,
        @Schema(description = "Page size", example = "20") int size,
        @Schema(description = "Total number of elements", example = "42") long totalElements,
        @Schema(description = "Total number of pages", example = "3") int totalPages
) {
}
