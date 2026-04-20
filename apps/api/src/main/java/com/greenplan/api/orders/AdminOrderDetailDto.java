package com.greenplan.api.orders;

import com.greenplan.api.reviews.ProductReviewDto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record AdminOrderDetailDto(
        Long id,
        String orderNo,
        String status,
        BigDecimal totalAmount,
        Long buyerId,
        String buyerUsername,
        String shippingStatus,
        LocalDateTime createdAt,
        LocalDateTime shippedAt,
        List<OrderItemDto> items,
        List<ProductReviewDto> reviews
) {
}
