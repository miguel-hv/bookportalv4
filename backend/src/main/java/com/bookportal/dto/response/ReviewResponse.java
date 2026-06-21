package com.bookportal.dto.response;

import com.bookportal.entity.BookReview;

import java.time.Instant;

public record ReviewResponse(Long id, String bookTitle, String reviewText, String userName, Instant createdAt) {

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
