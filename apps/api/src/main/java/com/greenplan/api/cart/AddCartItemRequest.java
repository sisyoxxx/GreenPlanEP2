package com.greenplan.api.cart;

public record AddCartItemRequest(Long productId, Integer quantity) {
}
