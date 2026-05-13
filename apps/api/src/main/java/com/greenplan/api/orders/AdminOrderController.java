package com.greenplan.api.orders;

import com.greenplan.api.common.ApiResponse;
import com.greenplan.api.security.SecurityUtils;
import org.springframework.security.access.prepost.PreAuthorize;
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
    public ApiResponse<List<AdminOrderListDto>> list() {
        return ApiResponse.ok(orderService.listAllForAdmin(SecurityUtils.requirePrincipal()));
    }

    @GetMapping("/{id}")
    public ApiResponse<AdminOrderDetailDto> detail(@PathVariable Long id) {
        return ApiResponse.ok(orderService.getDetailForAdmin(id, SecurityUtils.requirePrincipal()));
    }
}
