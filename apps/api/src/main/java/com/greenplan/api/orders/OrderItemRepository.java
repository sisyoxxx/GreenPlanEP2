package com.greenplan.api.orders;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderIdIn(List<Long> orderIds);

    @Query("select coalesce(sum(oi.quantity), 0) from OrderItem oi where oi.productId = :productId")
    Integer sumQuantityByProductId(@Param("productId") Long productId);

    @Query("select oi.productId, coalesce(sum(oi.quantity), 0) from OrderItem oi group by oi.productId")
    List<Object[]> sumQuantityGroupByProductId();

    @Query("select coalesce(sum(oi.quantity), 0) from OrderItem oi")
    Integer sumAllQuantities();

    @Query("select coalesce(sum(oi.lineTotal), 0) from OrderItem oi")
    BigDecimal sumAllLineTotals();
}
