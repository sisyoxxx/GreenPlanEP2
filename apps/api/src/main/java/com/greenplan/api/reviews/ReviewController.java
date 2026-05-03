package com.greenplan.api.reviews;

import com.greenplan.api.common.ApiResponse;
import com.greenplan.api.security.JwtUserPrincipal;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/products/{productId}/reviews")
    public ApiResponse<List<ProductReviewDto>> listProductReviews(@PathVariable Long productId) {
        return ApiResponse.ok(reviewService.listProductReviews(productId));
    }

    @GetMapping("/reviews/me")
    public ApiResponse<List<ProductReviewDto>> listMine(Authentication authentication) {
        return ApiResponse.ok(reviewService.listMine((JwtUserPrincipal) authentication.getPrincipal()));
    }

    @PostMapping("/orders/{orderId}/reviews")
    public ApiResponse<ProductReviewDto> createReview(
            @PathVariable Long orderId,
            @Valid @RequestBody CreateReviewRequest request,
            Authentication authentication
    ) {
        return ApiResponse.ok("评价提交成功", reviewService.createReview(orderId, request, (JwtUserPrincipal) authentication.getPrincipal()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/reviews")
    public ApiResponse<List<ProductReviewDto>> listAllForAdmin() {
        return ApiResponse.ok(reviewService.listAll());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/reviews/{reviewId}")
    public ApiResponse<Void> deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        return ApiResponse.ok("评价已删除", null);
    }
}
