package com.greenplan.api.cart;

import com.greenplan.api.common.ApiResponse;
import com.greenplan.api.security.SecurityUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ApiResponse<List<CartItemDto>> listMine() {
        return ApiResponse.ok(cartService.listMine(SecurityUtils.requirePrincipal()));
    }

    @PostMapping("/items")
    public ApiResponse<CartItemDto> addItem(@RequestBody AddCartItemRequest request) {
        return ApiResponse.ok(cartService.addItem(request, SecurityUtils.requirePrincipal()));
    }

    @PutMapping("/items/{productId}")
    public ApiResponse<CartItemDto> updateQuantity(
            @PathVariable Long productId,
            @RequestBody UpdateCartItemRequest request
    ) {
        return ApiResponse.ok(cartService.updateQuantity(productId, request, SecurityUtils.requirePrincipal()));
    }

    @DeleteMapping("/items/{productId}")
    public ApiResponse<Void> removeItem(@PathVariable Long productId) {
        cartService.removeItem(productId, SecurityUtils.requirePrincipal());
        return ApiResponse.ok(null);
    }

    @DeleteMapping
    public ApiResponse<Void> clear() {
        cartService.clear(SecurityUtils.requirePrincipal());
        return ApiResponse.ok(null);
    }
}
