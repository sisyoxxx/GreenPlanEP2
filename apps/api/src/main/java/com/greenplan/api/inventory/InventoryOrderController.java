package com.greenplan.api.inventory;

import com.greenplan.api.common.ApiResponse;
import com.greenplan.api.orders.BatchShipOrderRequest;
import com.greenplan.api.orders.InventoryOrderDto;
import com.greenplan.api.orders.InventoryOrderService;
import com.greenplan.api.orders.ShipOrderRequest;
import com.greenplan.api.orders.UpdateLogisticsRequest;
import com.greenplan.api.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory/orders")
@PreAuthorize("hasRole('INVENTORY_MANAGER')")
public class InventoryOrderController {

    private final InventoryOrderService inventoryOrderService;

    public InventoryOrderController(InventoryOrderService inventoryOrderService) {
        this.inventoryOrderService = inventoryOrderService;
    }

    @GetMapping
    public ApiResponse<List<InventoryOrderDto>> listAll() {
        return ApiResponse.ok(inventoryOrderService.listAll(SecurityUtils.requirePrincipal()));
    }

    @PatchMapping("/{id}/ship")
    public ApiResponse<InventoryOrderDto> ship(
            @PathVariable Long id,
            @Valid @RequestBody ShipOrderRequest request
    ) {
        return ApiResponse.ok("已发货", inventoryOrderService.ship(id, request, SecurityUtils.requirePrincipal()));
    }

    @PatchMapping("/batch-ship")
    public ApiResponse<List<InventoryOrderDto>> batchShip(@Valid @RequestBody BatchShipOrderRequest request) {
        return ApiResponse.ok("批量发货成功", inventoryOrderService.batchShip(request, SecurityUtils.requirePrincipal()));
    }

    @PatchMapping("/{id}/logistics")
    public ApiResponse<InventoryOrderDto> updateLogistics(
            @PathVariable Long id,
            @Valid @RequestBody UpdateLogisticsRequest request
    ) {
        return ApiResponse.ok("物流状态已更新", inventoryOrderService.updateLogistics(id, request, SecurityUtils.requirePrincipal()));
    }
}
