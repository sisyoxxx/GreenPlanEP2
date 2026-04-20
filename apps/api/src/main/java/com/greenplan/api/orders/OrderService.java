package com.greenplan.api.orders;

import com.greenplan.api.auth.RoleCode;
import com.greenplan.api.auth.User;
import com.greenplan.api.auth.UserRepository;
import com.greenplan.api.catalog.Product;
import com.greenplan.api.catalog.ProductRepository;
import com.greenplan.api.inventory.InventoryItem;
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
import java.util.HashMap;
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

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            ProductRepository productRepository,
            InventoryItemRepository inventoryItemRepository,
            InventoryMovementRepository movementRepository,
            UserRepository userRepository,
            ProductReviewRepository reviewRepository
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.inventoryItemRepository = inventoryItemRepository;
        this.movementRepository = movementRepository;
        this.userRepository = userRepository;
        this.reviewRepository = reviewRepository;
    }

    @Transactional
    public OrderDetailDto create(CreateOrderRequest request, JwtUserPrincipal principal) {
        if (principal.getRole() != RoleCode.BUYER) {
            throw new IllegalArgumentException("Only buyers can place orders");
        }

        List<OrderItem> itemsToSave = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (CreateOrderItemRequest itemReq : request.items()) {
            Product product = productRepository.findById(itemReq.productId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + itemReq.productId()));
            InventoryItem inventory = inventoryItemRepository.findByProductId(itemReq.productId())
                    .orElseThrow(() -> new IllegalArgumentException("Inventory record not found: " + itemReq.productId()));

            if (inventory.getOnlineStock() < itemReq.quantity()) {
                throw new IllegalArgumentException("Insufficient inventory: " + product.getName());
            }

            inventory.setOnlineStock(inventory.getOnlineStock() - itemReq.quantity());
            inventoryItemRepository.save(inventory);

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
        order.setStatus("PAID");
        order.setTotalAmount(total);
        order.setShippingStatus("PENDING");
        order.setCreatedAt(LocalDateTime.now());
        Order savedOrder = orderRepository.save(order);

        List<OrderItemDto> responseItems = new ArrayList<>();
        for (OrderItem orderItem : itemsToSave) {
            orderItem.setOrderId(savedOrder.getId());
            OrderItem saved = orderItemRepository.save(orderItem);
            responseItems.add(toItemDto(saved));

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

        return toDto(savedOrder, responseItems);
    }

    public List<OrderDetailDto> listMine(JwtUserPrincipal principal) {
        List<Order> orders = orderRepository.findByBuyerIdOrderByIdDesc(principal.getId());
        if (orders.isEmpty()) {
            return List.of();
        }

        List<Long> ids = orders.stream().map(Order::getId).toList();
        Map<Long, List<OrderItemDto>> itemMap = buildItemMap(ids);

        return orders.stream()
                .map(order -> toDto(order, itemMap.getOrDefault(order.getId(), List.of())))
                .toList();
    }

    @Transactional
    public OrderDetailDto confirmReceived(Long orderId, JwtUserPrincipal principal) {
        if (principal.getRole() != RoleCode.BUYER) {
            throw new IllegalArgumentException("Only buyers can confirm receipt");
        }

        Order order = orderRepository.findByIdAndBuyerId(orderId, principal.getId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found or no permission"));

        if (!"DELIVERED".equalsIgnoreCase(order.getStatus())) {
            order.setStatus("DELIVERED");
            order.setShippingStatus("DELIVERED");
            if (order.getShippedAt() == null) {
                order.setShippedAt(LocalDateTime.now());
            }
            order = orderRepository.save(order);
        }

        return toDto(order, listItems(order.getId()));
    }

    public List<AdminOrderListDto> listAllForAdmin(JwtUserPrincipal principal) {
        requireAdmin(principal);

        List<Order> orders = orderRepository.findAllByOrderByIdDesc();
        if (orders.isEmpty()) {
            return List.of();
        }

        Map<Long, String> buyerNameMap = buildBuyerNameMap(orders);

        return orders.stream()
                .map(order -> new AdminOrderListDto(
                        order.getId(),
                        order.getOrderNo(),
                        order.getStatus(),
                        order.getTotalAmount(),
                        order.getBuyerId(),
                        buyerNameMap.get(order.getBuyerId()),
                        order.getShippingStatus(),
                        order.getCreatedAt(),
                        order.getShippedAt()
                ))
                .toList();
    }

    public AdminOrderDetailDto getDetailForAdmin(Long orderId, JwtUserPrincipal principal) {
        requireAdmin(principal);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        String buyerUsername = userRepository.findById(order.getBuyerId())
                .map(User::getUsername)
                .orElse("Unknown");

        List<OrderItemDto> items = listItems(order.getId());
        List<ProductReviewDto> reviews = reviewRepository.findByOrderIdIn(List.of(order.getId())).stream()
                .map(this::toReviewDto)
                .toList();

        return new AdminOrderDetailDto(
                order.getId(),
                order.getOrderNo(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getBuyerId(),
                buyerUsername,
                order.getShippingStatus(),
                order.getCreatedAt(),
                order.getShippedAt(),
                items,
                reviews
        );
    }

    private void requireAdmin(JwtUserPrincipal principal) {
        if (principal.getRole() != RoleCode.ADMIN) {
            throw new IllegalArgumentException("Only admin can access this endpoint");
        }
    }

    private List<OrderItemDto> listItems(Long orderId) {
        return orderItemRepository.findByOrderIdIn(List.of(orderId)).stream()
                .map(this::toItemDto)
                .toList();
    }

    private OrderItemDto toItemDto(OrderItem item) {
        return new OrderItemDto(
                item.getProductId(),
                item.getProductNameSnapshot(),
                item.getPriceSnapshot(),
                item.getQuantity(),
                item.getLineTotal()
        );
    }

    private Map<Long, List<OrderItemDto>> buildItemMap(List<Long> orderIds) {
        Map<Long, List<OrderItemDto>> itemMap = new HashMap<>();
        for (OrderItem item : orderItemRepository.findByOrderIdIn(orderIds)) {
            itemMap.computeIfAbsent(item.getOrderId(), key -> new ArrayList<>()).add(toItemDto(item));
        }
        return itemMap;
    }

    private Map<Long, String> buildBuyerNameMap(List<Order> orders) {
        List<Long> buyerIds = orders.stream()
                .map(Order::getBuyerId)
                .filter(id -> id != null)
                .distinct()
                .toList();

        Map<Long, String> buyerNameMap = new HashMap<>();
        for (User user : userRepository.findAllById(buyerIds)) {
            buyerNameMap.put(user.getId(), user.getUsername());
        }
        return buyerNameMap;
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

    private OrderDetailDto toDto(Order order, List<OrderItemDto> items) {
        return new OrderDetailDto(
                order.getId(),
                order.getOrderNo(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getShippingCarrier(),
                order.getTrackingNo(),
                order.getShippingStatus(),
                order.getShippedAt(),
                order.getCreatedAt(),
                items
        );
    }
}
