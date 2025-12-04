package com.revature.revtickets.controller;

import com.revature.revtickets.document.Review;
import com.revature.revtickets.response.ApiResponse;
import com.revature.revtickets.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<ApiResponse<List<Review>>> getReviewsByMovie(@PathVariable Long movieId) {
        List<Review> reviews = reviewService.getReviewsByMovieId(movieId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Reviews retrieved", reviews));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<ApiResponse<List<Review>>> getReviewsByEvent(@PathVariable Long eventId) {
        List<Review> reviews = reviewService.getReviewsByEventId(eventId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Reviews retrieved", reviews));
    }

    @GetMapping("/movie/{movieId}/rating")
    public ResponseEntity<ApiResponse<Map<String, Double>>> getMovieRating(@PathVariable Long movieId) {
        Double rating = reviewService.getAverageRatingByMovieId(movieId);
        Map<String, Double> response = new HashMap<>();
        response.put("averageRating", rating);
        return ResponseEntity.ok(new ApiResponse<>(true, "Rating retrieved", response));
    }

    @GetMapping("/event/{eventId}/rating")
    public ResponseEntity<ApiResponse<Map<String, Double>>> getEventRating(@PathVariable Long eventId) {
        Double rating = reviewService.getAverageRatingByEventId(eventId);
        Map<String, Double> response = new HashMap<>();
        response.put("averageRating", rating);
        return ResponseEntity.ok(new ApiResponse<>(true, "Rating retrieved", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Review>> createReview(
            @RequestBody Review review,
            Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : "anonymous";
        Review created = reviewService.createReview(review, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponse<>(true, "Review created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Review>> updateReview(
            @PathVariable String id,
            @RequestBody Review review) {
        Review updated = reviewService.updateReview(id, review);
        return ResponseEntity.ok(new ApiResponse<>(true, "Review updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable String id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Review deleted successfully", null));
    }

    @GetMapping("/my-reviews")
    public ResponseEntity<ApiResponse<List<Review>>> getMyReviews(Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : "anonymous";
        List<Review> reviews = reviewService.getReviewsByUserEmail(userEmail);
        return ResponseEntity.ok(new ApiResponse<>(true, "Reviews retrieved", reviews));
    }
}
