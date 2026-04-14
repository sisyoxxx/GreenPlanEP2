package com.greenplan.api.inventory;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "inventory_movements")
public class InventoryMovement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(nullable = false, length = 32)
    private String type;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "source_ref_type", length = 32)
    private String sourceRefType;

    @Column(name = "source_ref_id", length = 64)
    private String sourceRefId;

    @Column(name = "operator_user_id")
    private Long operatorUserId;

    @Column(length = 255)
    private String remark;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
