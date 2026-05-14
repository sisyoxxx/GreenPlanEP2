package com.greenplan.api.inventory;

import com.greenplan.api.common.ApiResponse;
import com.greenplan.api.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;
    private final InventoryMovementRepository movementRepository;

    public InventoryController(InventoryService inventoryService, InventoryMovementRepository movementRepository) {
        this.inventoryService = inventoryService;
        this.movementRepository = movementRepository;
    }

    @GetMapping("/items")
    public ApiResponse<List<InventoryItemDto>> items() {
        return ApiResponse.ok(inventoryService.listItemDtos());
    }

    @GetMapping("/warnings")
    public ApiResponse<List<InventoryItemDto>> warnings() {
        return ApiResponse.ok(inventoryService.listWarningDtos());
    }

    @PatchMapping("/warnings")
    public ApiResponse<Void> updateWarning(@Valid @RequestBody WarningThresholdRequest request) {
        inventoryService.updateWarningThreshold(request, SecurityUtils.requirePrincipal());
        return ApiResponse.ok("预警阈值已更新");
    }

    @PostMapping("/inbound")
    public ApiResponse<Void> inbound(@Valid @RequestBody InventoryInboundRequest request) {
        inventoryService.inbound(request, SecurityUtils.requirePrincipal());
        return ApiResponse.ok("入库成功");
    }

    @GetMapping("/movements")
    public ApiResponse<List<InventoryMovement>> movements() {
        return ApiResponse.ok(movementRepository.findAll());
    }

    @GetMapping("/analytics")
    public ApiResponse<InventoryAnalyticsDto> analytics() {
        return ApiResponse.ok(inventoryService.analytics());
    }
}
