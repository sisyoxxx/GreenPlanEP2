package com.greenplan.api.orders;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_no", nullable = false, unique = true, length = 64)
    private String orderNo;

    @Column(name = "buyer_id", nullable = false)
    private Long buyerId;

    @Column(nullable = false, length = 32)
    private String status;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "shipping_carrier", length = 64)
    private String shippingCarrier;

    @Column(name = "tracking_no", length = 64)
    private String trackingNo;

    @Column(name = "shipping_status", length = 32)
    private String shippingStatus;

    @Column(name = "shipped_at")
    private LocalDateTime shippedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
