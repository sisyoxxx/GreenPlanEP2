package com.greenplan.api.inventory;

import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryInboundEntryRepository extends JpaRepository<InventoryInboundEntry, Long> {
}
