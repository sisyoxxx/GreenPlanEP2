package com.greenplan.api.reviews;

import java.time.LocalDateTime;

public record ProductReviewDto(
        Long id,
        Long productId,
        String productName,
        Long orderId,
        Long buyerId,
        String buyerUsername,
        Integer rating,
        String content,
        LocalDateTime createdAt
) {
}
