package com.greenplan.api.orders;

import com.greenplan.api.auth.RoleCode;
import com.greenplan.api.catalog.Product;
import com.greenplan.api.catalog.ProductRepository;
import com.greenplan.api.inventory.InventoryItem;
import com.greenplan.api.inventory.InventoryItemRepository;
import com.greenplan.api.inventory.InventoryMovement;
import com.greenplan.api.inventory.InventoryMovementRepository;
import com.greenplan.api.security.JwtUserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final InventoryMovementRepository movementRepository;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        ProductRepository productRepository,
                        InventoryItemRepository inventoryItemRepository,
                        InventoryMovementRepository movementRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.inventoryItemRepository = inventoryItemRepository;
        this.movementRepository = movementRepository;
    }

    @Transactional
    public OrderDetailDto create(CreateOrderRequest request, JwtUserPrincipal principal) {
        if (principal.getRole() != RoleCode.BUYER) {
            throw new IllegalArgumentException("仅买家可下单");
        }

        List<OrderItem> itemsToSave = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (CreateOrderItemRequest itemReq : request.items()) {
            Product product = productRepository.findById(itemReq.productId())
                    .orElseThrow(() -> new IllegalArgumentException("商品不存在: " + itemReq.productId()));
            InventoryItem inventory = inventoryItemRepository.findByProductId(itemReq.productId())
                    .orElseThrow(() -> new IllegalArgumentException("库存记录不存在: " + itemReq.productId()));

            if (inventory.getOnlineStock() < itemReq.quantity()) {
                throw new IllegalArgumentException("商品库存不足: " + product.getName());
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
        Order savedOrder = orderRepository.save(order);

        List<OrderItemDto> responseItems = new ArrayList<>();
        for (OrderItem orderItem : itemsToSave) {
            orderItem.setOrderId(savedOrder.getId());
            OrderItem saved = orderItemRepository.save(orderItem);
            responseItems.add(new OrderItemDto(saved.getProductId(), saved.getProductNameSnapshot(), saved.getPriceSnapshot(), saved.getQuantity(), saved.getLineTotal()));

            InventoryMovement movement = new InventoryMovement();
            movement.setProductId(saved.getProductId());
            movement.setType("SALE_DEDUCT");
            movement.setQuantity(saved.getQuantity());
            movement.setSourceRefType("ORDER");
            movement.setSourceRefId(savedOrder.getOrderNo());
            movement.setOperatorUserId(principal.getId());
            movement.setRemark("订单扣减库存");
            movementRepository.save(movement);
        }

        return new OrderDetailDto(savedOrder.getId(), savedOrder.getOrderNo(), savedOrder.getStatus(), savedOrder.getTotalAmount(), responseItems);
    }

    public List<OrderDetailDto> listMine(JwtUserPrincipal principal) {
        List<Order> orders = orderRepository.findByBuyerIdOrderByIdDesc(principal.getId());
        if (orders.isEmpty()) {
            return List.of();
        }
        List<Long> ids = orders.stream().map(Order::getId).toList();
        Map<Long, List<OrderItemDto>> map = new HashMap<>();
        for (OrderItem item : orderItemRepository.findByOrderIdIn(ids)) {
            map.computeIfAbsent(item.getOrderId(), k -> new ArrayList<>())
                    .add(new OrderItemDto(item.getProductId(), item.getProductNameSnapshot(), item.getPriceSnapshot(), item.getQuantity(), item.getLineTotal()));
        }
        return orders.stream()
                .map(o -> new OrderDetailDto(o.getId(), o.getOrderNo(), o.getStatus(), o.getTotalAmount(), map.getOrDefault(o.getId(), List.of())))
                .toList();
    }
}
