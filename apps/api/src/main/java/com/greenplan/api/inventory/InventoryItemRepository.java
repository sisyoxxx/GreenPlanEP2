package com.greenplan.api.inventory;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    Optional<InventoryItem> findByProductId(Long productId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "update inventory_items set version = 0 where version is null", nativeQuery = true)
    int initializeMissingVersions();
}
