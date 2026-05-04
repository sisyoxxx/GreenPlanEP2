package com.greenplan.api.cart;

import com.greenplan.api.common.ApiResponse;
import com.greenplan.api.security.JwtUserPrincipal;
import org.springframework.security.core.Authentication;
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
    public ApiResponse<List<CartItemDto>> listMine(Authentication authentication) {
        return ApiResponse.ok(cartService.listMine((JwtUserPrincipal) authentication.getPrincipal()));
    }

    @PostMapping("/items")
    public ApiResponse<CartItemDto> addItem(
            @RequestBody AddCartItemRequest request,
            Authentication authentication
    ) {
        return ApiResponse.ok(cartService.addItem(request, (JwtUserPrincipal) authentication.getPrincipal()));
    }

    @PutMapping("/items/{productId}")
    public ApiResponse<CartItemDto> updateQuantity(
            @PathVariable Long productId,
            @RequestBody UpdateCartItemRequest request,
            Authentication authentication
    ) {
        return ApiResponse.ok(cartService.updateQuantity(productId, request, (JwtUserPrincipal) authentication.getPrincipal()));
    }

    @DeleteMapping("/items/{productId}")
    public ApiResponse<Void> removeItem(
            @PathVariable Long productId,
            Authentication authentication
    ) {
        cartService.removeItem(productId, (JwtUserPrincipal) authentication.getPrincipal());
        return ApiResponse.ok(null);
    }

    @DeleteMapping
    public ApiResponse<Void> clear(Authentication authentication) {
        cartService.clear((JwtUserPrincipal) authentication.getPrincipal());
        return ApiResponse.ok(null);
    }
}
