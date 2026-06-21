package com.bookportal.service;

import com.bookportal.dto.request.CreateReviewRequest;
import com.bookportal.dto.response.ReviewResponse;
import com.bookportal.entity.BookReview;
import com.bookportal.entity.User;
import com.bookportal.repository.BookReviewRepository;
import com.bookportal.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookReviewServiceTest {

    @Mock
    private BookReviewRepository bookReviewRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BookReviewService bookReviewService;

    private User testUser;
    private BookReview testReview;
    private CreateReviewRequest validRequest;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();

        testUser = new User("testuser", "password");
        testUser.setId(1L);

        testReview = new BookReview();
        testReview.setId(1L);
        testReview.setBookTitle("Cien años de soledad");
        testReview.setReviewText("Una obra maestra.");
        testReview.setUser(testUser);
        testReview.setCreatedAt(Instant.now());

        validRequest = new CreateReviewRequest("Cien años de soledad", "Una obra maestra.");
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createReview_withBlankBookTitle_shouldThrow400() {
        CreateReviewRequest request = new CreateReviewRequest("", "Some text");

        assertThatThrownBy(() -> bookReviewService.createReview(request))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> {
                    ResponseStatusException rse = (ResponseStatusException) ex;
                    assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                });

        verify(bookReviewRepository, never()).save(any());
    }

    @Test
    void createReview_withNullBookTitle_shouldThrow400() {
        CreateReviewRequest request = new CreateReviewRequest(null, "Some text");

        assertThatThrownBy(() -> bookReviewService.createReview(request))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> {
                    ResponseStatusException rse = (ResponseStatusException) ex;
                    assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                });

        verify(bookReviewRepository, never()).save(any());
    }

    @Test
    void createReview_withBlankReviewText_shouldThrow400() {
        CreateReviewRequest request = new CreateReviewRequest("A title", "");

        assertThatThrownBy(() -> bookReviewService.createReview(request))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> {
                    ResponseStatusException rse = (ResponseStatusException) ex;
                    assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                });

        verify(bookReviewRepository, never()).save(any());
    }

    @Test
    void createReview_withNullReviewText_shouldThrow400() {
        CreateReviewRequest request = new CreateReviewRequest("A title", null);

        assertThatThrownBy(() -> bookReviewService.createReview(request))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> {
                    ResponseStatusException rse = (ResponseStatusException) ex;
                    assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                });

        verify(bookReviewRepository, never()).save(any());
    }

    @Test
    void createReview_withValidInput_shouldSaveAndReturnReviewResponse() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(1L, null, Collections.emptyList())
        );

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(bookReviewRepository.save(any(BookReview.class))).thenReturn(testReview);

        ReviewResponse response = bookReviewService.createReview(validRequest);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.bookTitle()).isEqualTo("Cien años de soledad");
        assertThat(response.reviewText()).isEqualTo("Una obra maestra.");
        assertThat(response.userName()).isEqualTo("testuser");
        assertThat(response.createdAt()).isNotNull();

        verify(bookReviewRepository).save(any(BookReview.class));
    }

    @Test
    void createReview_withValidInput_trimsWhitespace() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(1L, null, Collections.emptyList())
        );

        CreateReviewRequest requestWithSpaces = new CreateReviewRequest("  Title  ", "  Text  ");
        BookReview trimmedReview = new BookReview();
        trimmedReview.setId(2L);
        trimmedReview.setBookTitle("Title");
        trimmedReview.setReviewText("Text");
        trimmedReview.setUser(testUser);
        trimmedReview.setCreatedAt(Instant.now());

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(bookReviewRepository.save(any(BookReview.class))).thenReturn(trimmedReview);

        ReviewResponse response = bookReviewService.createReview(requestWithSpaces);

        assertThat(response.bookTitle()).isEqualTo("Title");
        assertThat(response.reviewText()).isEqualTo("Text");
    }

    @Test
    void getReviews_shouldReturnPaginatedReviewResponse() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<BookReview> reviewPage = new PageImpl<>(List.of(testReview), pageable, 1);

        when(bookReviewRepository.findAllByOrderByCreatedAtDesc(pageable)).thenReturn(reviewPage);

        Page<ReviewResponse> result = bookReviewService.getReviews(pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getTotalPages()).isEqualTo(1);
        assertThat(result.getNumber()).isEqualTo(0);

        ReviewResponse response = result.getContent().getFirst();
        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.bookTitle()).isEqualTo("Cien años de soledad");
        assertThat(response.reviewText()).isEqualTo("Una obra maestra.");
        assertThat(response.userName()).isEqualTo("testuser");
        assertThat(response.createdAt()).isNotNull();

        verify(bookReviewRepository).findAllByOrderByCreatedAtDesc(pageable);
    }

    @Test
    void getReviews_withEmptyDatabase_shouldReturnEmptyPage() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<BookReview> emptyPage = Page.empty();

        when(bookReviewRepository.findAllByOrderByCreatedAtDesc(pageable)).thenReturn(emptyPage);

        Page<ReviewResponse> result = bookReviewService.getReviews(pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).isEmpty();
        assertThat(result.getTotalElements()).isZero();
    }
}
