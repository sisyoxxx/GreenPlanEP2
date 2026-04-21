package com.greenplan.api.orders;

import com.greenplan.api.common.ApiResponse;
import com.greenplan.api.security.JwtUserPrincipal;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
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
    public ApiResponse<OrderDetailDto> create(@Valid @RequestBody CreateOrderRequest request, Authentication authentication) {
        return ApiResponse.ok("下单成功", orderService.create(request, (JwtUserPrincipal) authentication.getPrincipal()));
    }

    @GetMapping("/me")
    public ApiResponse<List<OrderDetailDto>> listMine(Authentication authentication) {
        return ApiResponse.ok(orderService.listMine((JwtUserPrincipal) authentication.getPrincipal()));
    }

    @PatchMapping("/{id}/received")
    public ApiResponse<OrderDetailDto> confirmReceived(@PathVariable Long id, Authentication authentication) {
        return ApiResponse.ok("已确认收货", orderService.confirmReceived(id, (JwtUserPrincipal) authentication.getPrincipal()));
    }
}
