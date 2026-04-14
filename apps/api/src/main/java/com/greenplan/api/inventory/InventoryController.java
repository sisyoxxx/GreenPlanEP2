package com.greenplan.api.inventory;

import com.greenplan.api.common.ApiResponse;
import com.greenplan.api.security.JwtUserPrincipal;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
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
    public ApiResponse<List<InventoryItem>> items() {
        return ApiResponse.ok(inventoryService.listItems());
    }

    @GetMapping("/warnings")
    public ApiResponse<List<InventoryItem>> warnings() {
        return ApiResponse.ok(inventoryService.listWarnings());
    }

    @PatchMapping("/warnings")
    public ApiResponse<Void> updateWarning(@Valid @RequestBody WarningThresholdRequest request, Authentication authentication) {
        inventoryService.updateWarningThreshold(request, (JwtUserPrincipal) authentication.getPrincipal());
        return ApiResponse.ok("预警阈值已更新");
    }

    @PostMapping("/inbound")
    public ApiResponse<Void> inbound(@Valid @RequestBody InventoryInboundRequest request, Authentication authentication) {
        inventoryService.inbound(request, (JwtUserPrincipal) authentication.getPrincipal());
        return ApiResponse.ok("入库成功");
    }

    @GetMapping("/movements")
    public ApiResponse<List<InventoryMovement>> movements() {
        return ApiResponse.ok(movementRepository.findAll());
    }
}
