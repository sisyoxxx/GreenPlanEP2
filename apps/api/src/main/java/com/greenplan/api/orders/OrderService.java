package com.greenplan.api.orders;

import com.greenplan.api.auth.RoleCode;
import com.greenplan.api.auth.User;
import com.greenplan.api.auth.UserRepository;
import com.greenplan.api.catalog.Product;
import com.greenplan.api.catalog.ProductRepository;
import com.greenplan.api.common.AuthorizationAssert;
import com.greenplan.api.common.OrderStatus;
import com.greenplan.api.common.ShippingStatus;
import com.greenplan.api.inventory.InventoryItemRepository;
import com.greenplan.api.inventory.InventoryMovement;
import com.greenplan.api.inventory.InventoryMovementRepository;
import com.greenplan.api.reviews.ProductReview;
import com.greenplan.api.reviews.ProductReviewDto;
import com.greenplan.api.reviews.ProductReviewRepository;
import com.greenplan.api.security.JwtUserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final InventoryMovementRepository movementRepository;
    private final UserRepository userRepository;
    private final ProductReviewRepository reviewRepository;
    private final OrderMapper orderMapper;

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            ProductRepository productRepository,
            InventoryItemRepository inventoryItemRepository,
            InventoryMovementRepository movementRepository,
            UserRepository userRepository,
            ProductReviewRepository reviewRepository,
            OrderMapper orderMapper
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.inventoryItemRepository = inventoryItemRepository;
        this.movementRepository = movementRepository;
        this.userRepository = userRepository;
        this.reviewRepository = reviewRepository;
        this.orderMapper = orderMapper;
    }

    @Transactional
    public OrderDetailDto create(CreateOrderRequest request, JwtUserPrincipal principal) {
        AuthorizationAssert.requireBuyer(principal);

        List<OrderItem> itemsToSave = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (CreateOrderItemRequest itemReq : request.items()) {
            Product product = productRepository.findById(itemReq.productId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + itemReq.productId()));

            int deducted = inventoryItemRepository.deductStock(itemReq.productId(), itemReq.quantity());
            if (deducted == 0) {
                throw new IllegalArgumentException("Insufficient inventory: " + product.getName());
            }

            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.quantity()));
            total = total.add(lineTotal);

            OrderItem orderItem = new OrderItem();
            orderItem.setProductId(product.getId());
            orderItem.setProductNameSnapshot(product.getName());
            orderItem.setPriceSnapshot(product.getPrice());
            orderItem.setQuantity(itemReq.quantity());
            orderItem.setLineTotal(lineTotal);
            itemsToSave.add(orderItem);
        }

        Order order = new Order();
        order.setOrderNo("GP" + System.currentTimeMillis());
        order.setBuyerId(principal.getId());
        order.setStatus(OrderStatus.PAID);
        order.setTotalAmount(total);
        order.setShippingStatus(ShippingStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        Order savedOrder = orderRepository.save(order);

        List<OrderItemDto> responseItems = new ArrayList<>();
        for (OrderItem orderItem : itemsToSave) {
            orderItem.setOrderId(savedOrder.getId());
            OrderItem saved = orderItemRepository.save(orderItem);
            responseItems.add(orderMapper.toItemDto(saved));

            InventoryMovement movement = new InventoryMovement();
            movement.setProductId(saved.getProductId());
            movement.setType("SALE_DEDUCT");
            movement.setQuantity(-saved.getQuantity());
            movement.setSourceRefType("ORDER");
            movement.setSourceRefId(savedOrder.getOrderNo());
            movement.setOperatorUserId(principal.getId());
            movement.setRemark("Order stock deduction");
            movementRepository.save(movement);
        }

        return orderMapper.toDetailDto(savedOrder, responseItems);
    }

    public List<OrderDetailDto> listMine(JwtUserPrincipal principal) {
        List<Order> orders = orderRepository.findByBuyerIdOrderByIdDesc(principal.getId());
        if (orders.isEmpty()) {
            return List.of();
        }

        List<Long> ids = orders.stream().map(Order::getId).toList();
        Map<Long, List<OrderItemDto>> itemMap = orderMapper.buildItemMap(ids);

        return orders.stream()
                .map(order -> orderMapper.toDetailDto(order, itemMap.getOrDefault(order.getId(), List.of())))
                .toList();
    }

    @Transactional
    public OrderDetailDto confirmReceived(Long orderId, JwtUserPrincipal principal) {
        AuthorizationAssert.requireBuyer(principal);

        Order order = orderRepository.findByIdAndBuyerId(orderId, principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found or no permission"));

        if (order.getStatus() != OrderStatus.SHIPPED) {
            throw new IllegalArgumentException("Only shipped orders can be confirmed");
        }

        order.setStatus(OrderStatus.DELIVERED);
        order.setShippingStatus(ShippingStatus.DELIVERED);
        if (order.getShippedAt() == null) {
            order.setShippedAt(LocalDateTime.now());
        }
        order = orderRepository.save(order);

        return orderMapper.toDetailDto(order, orderMapper.listItems(order.getId()));
    }

    public List<AdminOrderListDto> listAllForAdmin(JwtUserPrincipal principal) {
        AuthorizationAssert.requireAdmin(principal);

        List<Order> orders = orderRepository.findAllByOrderByIdDesc();
        if (orders.isEmpty()) {
            return List.of();
        }

        Map<Long, String> buyerNameMap = orderMapper.buildBuyerNameMap(orders);

        return orders.stream()
                .map(order -> new AdminOrderListDto(
                        order.getId(),
                        order.getOrderNo(),
                        order.getStatus().name(),
                        order.getTotalAmount(),
                        order.getBuyerId(),
                        buyerNameMap.get(order.getBuyerId()),
                        order.getShippingStatus() == null ? null : order.getShippingStatus().name(),
                        order.getCreatedAt(),
                        order.getShippedAt()
                ))
                .toList();
    }

    public AdminOrderDetailDto getDetailForAdmin(Long orderId, JwtUserPrincipal principal) {
        AuthorizationAssert.requireAdmin(principal);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        String buyerUsername = userRepository.findById(order.getBuyerId())
                .map(User::getUsername)
                .orElse("Unknown");

        List<OrderItemDto> items = orderMapper.listItems(order.getId());
        List<ProductReviewDto> reviews = reviewRepository.findByOrderIdIn(List.of(order.getId())).stream()
                .map(this::toReviewDto)
                .toList();

        return new AdminOrderDetailDto(
                order.getId(),
                order.getOrderNo(),
                order.getStatus().name(),
                order.getTotalAmount(),
                order.getBuyerId(),
                buyerUsername,
                order.getShippingStatus() == null ? null : order.getShippingStatus().name(),
                order.getCreatedAt(),
                order.getShippedAt(),
                items,
                reviews
        );
    }

    private ProductReviewDto toReviewDto(ProductReview review) {
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
