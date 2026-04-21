package com.greenplan.api.inventory;

import com.greenplan.api.auth.RoleCode;
import com.greenplan.api.catalog.Product;
import com.greenplan.api.catalog.ProductRepository;
import com.greenplan.api.security.JwtUserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class InventoryService {

    private final InventoryItemRepository inventoryItemRepository;
    private final InventoryInboundEntryRepository inboundEntryRepository;
    private final InventoryMovementRepository movementRepository;
    private final ProductRepository productRepository;

    public InventoryService(InventoryItemRepository inventoryItemRepository,
                            InventoryInboundEntryRepository inboundEntryRepository,
                            InventoryMovementRepository movementRepository,
                            ProductRepository productRepository) {
        this.inventoryItemRepository = inventoryItemRepository;
        this.inboundEntryRepository = inboundEntryRepository;
        this.movementRepository = movementRepository;
        this.productRepository = productRepository;
    }

    public List<InventoryItem> listItems() {
        return inventoryItemRepository.findAll();
    }

    public List<InventoryItem> listWarnings() {
        return inventoryItemRepository.findAll().stream()
                .filter(item -> item.getOnlineStock() <= item.getWarningThreshold())
                .toList();
    }

    public List<InventoryItemDto> listItemDtos() {
        Map<Long, InventoryItem> byProductId = new HashMap<>();
        for (InventoryItem item : inventoryItemRepository.findAll()) {
            if (item.getProduct() != null && item.getProduct().getId() != null) {
                byProductId.put(item.getProduct().getId(), item);
            }
        }

        return productRepository.findAll().stream()
                .map(p -> {
                    InventoryItem item = byProductId.get(p.getId());
                    return new InventoryItemDto(
                            item == null ? null : item.getId(),
                            p.getId(),
                            p.getSku(),
                            p.getName(),
                            item == null ? 0 : item.getOnlineStock(),
                            item == null ? 5 : item.getWarningThreshold()
                    );
                })
                .toList();
    }

    public List<InventoryItemDto> listWarningDtos() {
        return listItemDtos().stream()
                .filter(dto -> dto.onlineStock() != null && dto.warningThreshold() != null && dto.onlineStock() <= dto.warningThreshold())
                .toList();
    }

    @Transactional
    public void updateWarningThreshold(WarningThresholdRequest request, JwtUserPrincipal principal) {
        if (principal.getRole() != RoleCode.INVENTORY_MANAGER) {
            throw new IllegalArgumentException("无权限设置库存预警阈值");
        }
        if (request.warningThreshold() < 0) {
            throw new IllegalArgumentException("预警阈值不能为负数");
        }

        InventoryItem item = inventoryItemRepository.findByProductId(request.productId())
                .orElseThrow(() -> new IllegalArgumentException("库存记录不存在"));
        item.setWarningThreshold(request.warningThreshold());
        inventoryItemRepository.save(item);
    }

    @Transactional
    public void inbound(InventoryInboundRequest request, JwtUserPrincipal principal) {
        if (principal.getRole() != RoleCode.INVENTORY_MANAGER) {
            throw new IllegalArgumentException("无权限入库");
        }
        if (request.quantity() <= 0) {
            throw new IllegalArgumentException("入库数量必须大于 0");
        }

        InventoryItem item = inventoryItemRepository.findByProductId(request.productId())
                .orElseGet(() -> createInventoryItem(request.productId()));
        item.setOnlineStock(item.getOnlineStock() + request.quantity());
        inventoryItemRepository.save(item);

        InventoryInboundEntry entry = new InventoryInboundEntry();
        entry.setProductId(request.productId());
        entry.setQuantity(request.quantity());
        entry.setNote(request.note());
        entry.setCreatedBy(principal.getId());
        inboundEntryRepository.save(entry);

        InventoryMovement movement = new InventoryMovement();
        movement.setProductId(request.productId());
        movement.setType("INBOUND");
        movement.setQuantity(request.quantity());
        movement.setSourceRefType("INBOUND_ENTRY");
        movement.setSourceRefId(String.valueOf(entry.getId()));
        movement.setOperatorUserId(principal.getId());
        movement.setRemark(request.note());
        movementRepository.save(movement);
    }

    private InventoryItem createInventoryItem(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("商品不存在"));

        InventoryItem item = new InventoryItem();
        item.setProduct(product);
        item.setOnlineStock(0);
        item.setWarningThreshold(5);
        return inventoryItemRepository.save(item);
    }
}
