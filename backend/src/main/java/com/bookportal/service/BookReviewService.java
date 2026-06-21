package com.bookportal.service;

import com.bookportal.dto.request.CreateReviewRequest;
import com.bookportal.dto.response.ReviewResponse;
import com.bookportal.entity.BookReview;
import com.bookportal.entity.User;
import com.bookportal.repository.BookReviewRepository;
import com.bookportal.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BookReviewService {

    private final BookReviewRepository bookReviewRepository;
    private final UserRepository userRepository;

    public BookReviewService(BookReviewRepository bookReviewRepository, UserRepository userRepository) {
        this.bookReviewRepository = bookReviewRepository;
        this.userRepository = userRepository;
    }

    public void validateCreateReview(String bookTitle, String reviewText) {
        if (bookTitle == null || bookTitle.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El título del libro es requerido");
        }
        if (reviewText == null || reviewText.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La reseña es requerida");
        }
    }

    @Transactional
    public ReviewResponse createReview(CreateReviewRequest request) {
        validateCreateReview(request.bookTitle(), request.reviewText());

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = (Long) authentication.getPrincipal();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        BookReview review = new BookReview();
        review.setBookTitle(request.bookTitle().trim());
        review.setReviewText(request.reviewText().trim());
        review.setUser(user);

        BookReview saved = bookReviewRepository.save(review);
        return ReviewResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviews(Pageable pageable) {
        return bookReviewRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(ReviewResponse::from);
    }
}
