package com.greenplan.api.reviews;

import com.greenplan.api.auth.RoleCode;
import com.greenplan.api.orders.Order;
import com.greenplan.api.orders.OrderItem;
import com.greenplan.api.orders.OrderItemRepository;
import com.greenplan.api.orders.OrderRepository;
import com.greenplan.api.security.JwtUserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    private final ProductReviewRepository productReviewRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    public ReviewService(
            ProductReviewRepository productReviewRepository,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository
    ) {
        this.productReviewRepository = productReviewRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
    }

    public List<ProductReviewDto> listProductReviews(Long productId) {
        return productReviewRepository.findByProductIdOrderByIdDesc(productId).stream()
                .map(this::toDto)
                .toList();
    }

    public List<ProductReviewDto> listMine(JwtUserPrincipal principal) {
        if (principal.getRole() != RoleCode.BUYER) {
            throw new IllegalArgumentException("仅买家可查看自己的评价");
        }

        return productReviewRepository.findByBuyerIdOrderByIdDesc(principal.getId()).stream()
                .map(this::toDto)
                .toList();
    }

    public List<ProductReviewDto> listAll() {
        return productReviewRepository.findAllByOrderByIdDesc().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        ProductReview review = productReviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("评价不存在"));
        productReviewRepository.delete(review);
    }

    @Transactional
    public ProductReviewDto createReview(Long orderId, CreateReviewRequest request, JwtUserPrincipal principal) {
        if (principal.getRole() != RoleCode.BUYER) {
            throw new IllegalArgumentException("仅买家可提交评价");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("订单不存在"));
        if (!principal.getId().equals(order.getBuyerId())) {
            throw new IllegalArgumentException("当前订单不属于你");
        }
        if (order.getStatus() == com.greenplan.api.common.OrderStatus.PAID) {
            throw new IllegalArgumentException("订单发货后才能评价");
        }

        OrderItem item = orderItemRepository.findByOrderIdIn(List.of(orderId)).stream()
                .filter(orderItem -> request.productId().equals(orderItem.getProductId()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("该商品不在当前订单中"));

        if (productReviewRepository.existsByOrderIdAndProductIdAndBuyerId(orderId, request.productId(), principal.getId())) {
            throw new IllegalArgumentException("该订单商品已评价");
        }

        ProductReview review = new ProductReview();
        review.setProductId(item.getProductId());
        review.setProductNameSnapshot(item.getProductNameSnapshot());
        review.setOrderId(orderId);
        review.setBuyerId(principal.getId());
        review.setBuyerUsernameSnapshot(principal.getUsername());
        review.setRating(request.rating());
        review.setContent(request.content());

        return toDto(productReviewRepository.save(review));
    }

    private ProductReviewDto toDto(ProductReview review) {
        return new ProductReviewDto(
                review.getId(),
                review.getProductId(),
                review.getProductNameSnapshot(),
                review.getOrderId(),
                review.getBuyerId(),
                review.getBuyerUsernameSnapshot(),
                review.getRating(),
                review.getContent(),
                review.getCreatedAt()
        );
    }
}
