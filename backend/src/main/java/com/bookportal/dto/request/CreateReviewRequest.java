package com.bookportal.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request body for creating a book review")
public record CreateReviewRequest(
    @Schema(description = "Title of the book", example = "The Great Gatsby", required = true) String bookTitle,
    @Schema(description = "Review text content", example = "A masterpiece of American literature...", required = true) String reviewText
) {
}
