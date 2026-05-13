package com.greenplan.api.reviews;

import com.greenplan.api.catalog.ProductRepository;
import com.greenplan.api.common.OrderStatus;
import com.greenplan.api.common.exception.BusinessException;
import com.greenplan.api.common.exception.PermissionDeniedException;
import com.greenplan.api.common.exception.ResourceNotFoundException;
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
    private final ProductRepository productRepository;

    public ReviewService(
            ProductReviewRepository productReviewRepository,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            ProductRepository productRepository
    ) {
        this.productReviewRepository = productReviewRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
    }

    public List<ProductReviewDto> listProductReviews(Long productId) {
        return productReviewRepository.findByProductIdOrderByIdDesc(productId).stream()
                .map(this::toDto)
                .toList();
    }

    public List<ProductReviewDto> listMine(JwtUserPrincipal principal) {
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
                .orElseThrow(() -> new ResourceNotFoundException("评价不存在"));
        productReviewRepository.delete(review);
    }

    @Transactional
    public ProductReviewDto createReview(Long orderId, CreateReviewRequest request, JwtUserPrincipal principal) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("订单不存在"));
        if (!principal.getId().equals(order.getBuyerId())) {
            throw new PermissionDeniedException("当前订单不属于你");
        }
        if (order.getStatus() == OrderStatus.PAID) {
            throw new BusinessException("订单发货后才能评价");
        }

        OrderItem item = orderItemRepository.findByOrderIdIn(List.of(orderId)).stream()
                .filter(orderItem -> request.productId().equals(orderItem.getProductId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("该商品不在当前订单中"));

        if (productReviewRepository.existsByOrderIdAndProductIdAndBuyerId(orderId, request.productId(), principal.getId())) {
            throw new BusinessException("该订单商品已评价");
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
        String status = productRepository.findById(review.getProductId())
                .map(p -> p.getStatus())
                .orElse(null);
        return new ProductReviewDto(
                review.getId(),
                review.getProductId(),
                review.getProductNameSnapshot(),
                review.getOrderId(),
                review.getBuyerId(),
                review.getBuyerUsernameSnapshot(),
                review.getRating(),
                review.getContent(),
                review.getCreatedAt(),
                status
        );
    }
}
