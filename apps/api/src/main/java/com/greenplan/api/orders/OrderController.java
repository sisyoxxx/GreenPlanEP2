package com.greenplan.api.orders;

import com.greenplan.api.common.ApiResponse;
import com.greenplan.api.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ApiResponse<OrderDetailDto> create(@Valid @RequestBody CreateOrderRequest request) {
        return ApiResponse.ok("下单成功", orderService.create(request, SecurityUtils.requirePrincipal()));
    }

    @GetMapping("/me")
    public ApiResponse<List<OrderDetailDto>> listMine() {
        return ApiResponse.ok(orderService.listMine(SecurityUtils.requirePrincipal()));
    }

    @PatchMapping("/{id}/received")
    public ApiResponse<OrderDetailDto> confirmReceived(@PathVariable Long id) {
        return ApiResponse.ok("已确认收货", orderService.confirmReceived(id, SecurityUtils.requirePrincipal()));
    }
}
