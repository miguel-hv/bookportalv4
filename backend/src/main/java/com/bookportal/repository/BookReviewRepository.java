package com.bookportal.repository;

import com.bookportal.entity.BookReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface BookReviewRepository extends JpaRepository<BookReview, Long> {

    @Query("SELECT r FROM BookReview r JOIN FETCH r.user ORDER BY r.createdAt DESC")
    Page<BookReview> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
