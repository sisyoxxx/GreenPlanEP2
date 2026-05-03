package com.greenplan.api.reviews;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
    List<ProductReview> findByProductIdOrderByIdDesc(Long productId);

    List<ProductReview> findByBuyerIdOrderByIdDesc(Long buyerId);

    List<ProductReview> findByOrderIdIn(Collection<Long> orderIds);

    List<ProductReview> findAllByOrderByIdDesc();

    boolean existsByOrderIdAndProductIdAndBuyerId(Long orderId, Long productId, Long buyerId);
}
