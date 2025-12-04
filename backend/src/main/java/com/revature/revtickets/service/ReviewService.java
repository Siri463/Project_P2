package com.revature.revtickets.service;

import com.revature.revtickets.document.Review;
import com.revature.revtickets.entity.User;
import com.revature.revtickets.exception.ResourceNotFoundException;
import com.revature.revtickets.repository.ReviewRepository;
import com.revature.revtickets.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Review> getReviewsByMovieId(Long movieId) {
        return reviewRepository.findByMovieIdOrderByCreatedAtDesc(movieId);
    }

    public List<Review> getReviewsByEventId(Long eventId) {
        return reviewRepository.findByEventIdOrderByCreatedAtDesc(eventId);
    }

    public List<Review> getReviewsByUserId(Long userId) {
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Review createReview(Review review, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        review.setUserId(user.getUserId());
        review.setUserName(user.getFullName());
        review.setCreatedAt(LocalDateTime.now());
        review.setUpdatedAt(LocalDateTime.now());

        return reviewRepository.save(review);
    }

    public Review updateReview(String id, Review reviewDetails) {
        Review review = reviewRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));

        review.setRating(reviewDetails.getRating());
        review.setComment(reviewDetails.getComment());
        review.setUpdatedAt(LocalDateTime.now());

        return reviewRepository.save(review);
    }

    public void deleteReview(String id) {
        Review review = reviewRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));
        reviewRepository.delete(review);
    }

    public Double getAverageRatingByMovieId(Long movieId) {
        List<Review> reviews = reviewRepository.findByMovieIdOrderByCreatedAtDesc(movieId);
        if (reviews.isEmpty()) {
            return 0.0;
        }
        return reviews.stream()
            .mapToDouble(Review::getRating)
            .average()
            .orElse(0.0);
    }

    public Double getAverageRatingByEventId(Long eventId) {
        List<Review> reviews = reviewRepository.findByEventIdOrderByCreatedAtDesc(eventId);
        if (reviews.isEmpty()) {
            return 0.0;
        }
        return reviews.stream()
            .mapToDouble(Review::getRating)
            .average()
            .orElse(0.0);
    }

    public List<Review> getReviewsByUserEmail(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(user.getUserId());
    }
}
