package com.greenplan.api.orders;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByBuyerIdOrderByIdDesc(Long buyerId);

    List<Order> findAllByOrderByIdDesc();

    Optional<Order> findByIdAndBuyerId(Long id, Long buyerId);
}
