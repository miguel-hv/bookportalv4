package com.bookportal.controller;

import com.bookportal.dto.request.CreateReviewRequest;
import com.bookportal.dto.response.ReviewResponse;
import com.bookportal.service.BookReviewService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reviews")
public class BookReviewController {

    private final BookReviewService bookReviewService;

    public BookReviewController(BookReviewService bookReviewService) {
        this.bookReviewService = bookReviewService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponse createReview(@RequestBody CreateReviewRequest request) {
        return bookReviewService.createReview(request);
    }

    @GetMapping
    public Page<ReviewResponse> getReviews(@PageableDefault(size = 20) Pageable pageable) {
        return bookReviewService.getReviews(pageable);
    }
}
