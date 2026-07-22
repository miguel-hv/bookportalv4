package com.bookportal.dto.response;

import com.bookportal.entity.BookReview;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(description = "Book review response")
public record ReviewResponse(
    @Schema(description = "Review ID") Long id,
    @Schema(description = "Book title", example = "The Great Gatsby") String bookTitle,
    @Schema(description = "Review text content") String reviewText,
    @Schema(description = "Reviewer's username", example = "john_doe") String userName,
    @Schema(description = "Review creation timestamp") Instant createdAt
) {

    public static ReviewResponse from(BookReview review) {
        return new ReviewResponse(
                review.getId(),
                review.getBookTitle(),
                review.getReviewText(),
                review.getUser().getName(),
                review.getCreatedAt()
        );
    }
}
