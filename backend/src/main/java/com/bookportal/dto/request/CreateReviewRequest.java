package com.bookportal.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request body for creating a book review")
public record CreateReviewRequest(
    @Schema(description = "Title of the book", example = "The Great Gatsby", required = true)
    @NotBlank(message = "El título del libro es requerido")
    String bookTitle,

    @Schema(description = "Review text content", example = "A masterpiece of American literature...", required = true)
    @NotBlank(message = "La reseña es requerida")
    String reviewText
) {
}
