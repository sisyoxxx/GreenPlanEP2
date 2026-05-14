package com.greenplan.api.inventory;

import com.greenplan.api.auth.RoleCode;
import com.greenplan.api.catalog.Product;
import com.greenplan.api.catalog.ProductRepository;
import com.greenplan.api.common.AuthorizationAssert;
import com.greenplan.api.common.exception.BusinessException;
import com.greenplan.api.common.exception.ResourceNotFoundException;
import com.greenplan.api.security.JwtUserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    private static final int DEFAULT_WARNING_THRESHOLD = 5;

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
                            item == null ? DEFAULT_WARNING_THRESHOLD : item.getWarningThreshold()
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
        AuthorizationAssert.requireRole(principal, RoleCode.INVENTORY_MANAGER, "无权限设置库存预警阈值");
        if (request.warningThreshold() < 0) {
            throw new BusinessException("预警阈值不能为负数");
        }

        InventoryItem item = inventoryItemRepository.findByProductId(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("库存记录不存在"));
        item.setWarningThreshold(request.warningThreshold());
        inventoryItemRepository.save(item);
    }

    @Transactional
    public void inbound(InventoryInboundRequest request, JwtUserPrincipal principal) {
        AuthorizationAssert.requireRole(principal, RoleCode.INVENTORY_MANAGER, "无权限入库");
        if (request.quantity() <= 0) {
            throw new BusinessException("入库数量必须大于 0");
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
                .orElseThrow(() -> new ResourceNotFoundException("商品不存在"));

        InventoryItem item = new InventoryItem();
        item.setProduct(product);
        item.setOnlineStock(0);
        item.setWarningThreshold(DEFAULT_WARNING_THRESHOLD);
        return inventoryItemRepository.save(item);
    }

    public InventoryAnalyticsDto analytics() {
        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime thirtyDaysAgo = LocalDate.now().minusDays(29).atStartOfDay();

        List<InventoryMovement> monthMovements = movementRepository.findByCreatedAtGreaterThanEqual(monthStart);
        List<InventoryMovement> thirtyDayMovements = movementRepository.findByCreatedAtGreaterThanEqual(thirtyDaysAgo);

        Map<Long, Product> productMap = productRepository.findAll().stream()
                .collect(Collectors.toMap(Product::getId, p -> p));

        // outbound by product (this month)
        Map<Long, Integer> outboundQtyByProduct = new HashMap<>();
        for (InventoryMovement m : monthMovements) {
            if ("OUTBOUND".equals(m.getType()) || "SALE_DEDUCT".equals(m.getType())) {
                outboundQtyByProduct.merge(m.getProductId(), Math.abs(m.getQuantity()), Integer::sum);
            }
        }

        List<InventoryAnalyticsDto.ProductOutboundStat> outboundByProduct = outboundQtyByProduct.entrySet().stream()
                .sorted(Map.Entry.<Long, Integer>comparingByValue().reversed())
                .map(e -> {
                    Product p = productMap.get(e.getKey());
                    return new InventoryAnalyticsDto.ProductOutboundStat(
                            e.getKey(),
                            p != null ? p.getSku() : null,
                            p != null ? p.getName() : "商品#" + e.getKey(),
                            e.getValue()
                    );
                })
                .toList();

        // totals
        int inboundTotal = monthMovements.stream()
                .filter(m -> "INBOUND".equals(m.getType()))
                .mapToInt(InventoryMovement::getQuantity)
                .sum();
        int outboundTotal = monthMovements.stream()
                .filter(m -> "OUTBOUND".equals(m.getType()) || "SALE_DEDUCT".equals(m.getType()))
                .mapToInt(m -> Math.abs(m.getQuantity()))
                .sum();

        int currentTotalStock = inventoryItemRepository.findAll().stream()
                .mapToInt(InventoryItem::getOnlineStock)
                .sum();

        // daily trend (last 30 days)
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MM-dd");
        Map<String, int[]> trendMap = new LinkedHashMap<>();
        for (int i = 29; i >= 0; i--) {
            String key = LocalDate.now().minusDays(i).format(fmt);
            trendMap.put(key, new int[]{0, 0}); // [inbound, outbound]
        }

        for (InventoryMovement m : thirtyDayMovements) {
            String key = m.getCreatedAt().toLocalDate().format(fmt);
            int[] arr = trendMap.get(key);
            if (arr == null) continue;
            if ("INBOUND".equals(m.getType())) {
                arr[0] += m.getQuantity();
            } else if ("OUTBOUND".equals(m.getType()) || "SALE_DEDUCT".equals(m.getType())) {
                arr[1] += Math.abs(m.getQuantity());
            }
        }

        List<InventoryAnalyticsDto.DailyTrend> dailyTrend = trendMap.entrySet().stream()
                .map(e -> new InventoryAnalyticsDto.DailyTrend(e.getKey(), e.getValue()[0], e.getValue()[1]))
                .toList();

        return new InventoryAnalyticsDto(outboundByProduct, dailyTrend, inboundTotal, outboundTotal, currentTotalStock);
    }
}
