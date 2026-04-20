package com.greenplan.api.orders;

import com.greenplan.api.common.ApiResponse;
import com.greenplan.api.security.JwtUserPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ApiResponse<List<AdminOrderListDto>> list(Authentication authentication) {
        return ApiResponse.ok(orderService.listAllForAdmin((JwtUserPrincipal) authentication.getPrincipal()));
    }

    @GetMapping("/{id}")
    public ApiResponse<AdminOrderDetailDto> detail(@PathVariable Long id, Authentication authentication) {
        return ApiResponse.ok(orderService.getDetailForAdmin(id, (JwtUserPrincipal) authentication.getPrincipal()));
    }
}
