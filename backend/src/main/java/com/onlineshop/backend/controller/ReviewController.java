package com.onlineshop.backend.controller;

import com.onlineshop.backend.dto.ReviewDto;
import com.onlineshop.backend.model.Review;
import com.onlineshop.backend.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = {"http://localhost", "http://192.168.0.105"})
public class ReviewController {
    @Autowired
    private ReviewService reviewService;

    @PostMapping("/product/{productId}")
    public ResponseEntity<ReviewDto> addReview(@PathVariable Long productId, @RequestBody Review review) {
        Review saved = reviewService.addReview(productId, review);
        return ResponseEntity.ok(mapToDto(saved));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewDto>> getReviews(@PathVariable Long productId) {
        List<Review> reviews = reviewService.getReviewsByProduct(productId);
        List<ReviewDto> dtos = reviews.stream().map(this::mapToDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    private ReviewDto mapToDto(Review review) {
        ReviewDto dto = new ReviewDto();
        dto.setId(review.getId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setUserName(review.getUserName());
        dto.setCreatedAt(review.getCreatedAt());
        return dto;
    }
}
