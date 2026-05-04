package com.greenplan.api.cart;

import com.greenplan.api.catalog.Product;
import com.greenplan.api.catalog.ProductRepository;
import com.greenplan.api.inventory.InventoryItem;
import com.greenplan.api.inventory.InventoryItemRepository;
import com.greenplan.api.security.JwtUserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final InventoryItemRepository inventoryItemRepository;

    public CartService(
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            InventoryItemRepository inventoryItemRepository
    ) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.inventoryItemRepository = inventoryItemRepository;
    }

    public List<CartItemDto> listMine(JwtUserPrincipal principal) {
        List<CartItem> items = cartItemRepository.findByUserIdOrderByCreatedAtDesc(principal.getId());
        return items.stream().map(this::toDto).toList();
    }

    @Transactional
    public CartItemDto addItem(AddCartItemRequest request, JwtUserPrincipal principal) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + request.productId()));

        int maxStock = getOnlineStock(product.getId());
        int safeQuantity = Math.max(1, Math.min(request.quantity(), Math.max(1, maxStock)));

        CartItem item = cartItemRepository.findByUserIdAndProductId(principal.getId(), request.productId())
                .orElse(null);

        if (item != null) {
            int newQuantity = Math.min(item.getQuantity() + safeQuantity, Math.max(1, maxStock));
            item.setQuantity(newQuantity);
            item.setUpdatedAt(LocalDateTime.now());
        } else {
            item = new CartItem();
            item.setUserId(principal.getId());
            item.setProductId(request.productId());
            item.setQuantity(safeQuantity);
            item.setCreatedAt(LocalDateTime.now());
            item.setUpdatedAt(LocalDateTime.now());
        }

        CartItem saved = cartItemRepository.save(item);
        return toDto(saved);
    }

    @Transactional
    public CartItemDto updateQuantity(Long productId, UpdateCartItemRequest request, JwtUserPrincipal principal) {
        CartItem item = cartItemRepository.findByUserIdAndProductId(principal.getId(), productId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        int maxStock = getOnlineStock(productId);
        int safeQuantity = Math.max(1, Math.min(request.quantity(), Math.max(1, maxStock)));

        item.setQuantity(safeQuantity);
        item.setUpdatedAt(LocalDateTime.now());
        CartItem saved = cartItemRepository.save(item);
        return toDto(saved);
    }

    @Transactional
    public void removeItem(Long productId, JwtUserPrincipal principal) {
        cartItemRepository.deleteByUserIdAndProductId(principal.getId(), productId);
    }

    @Transactional
    public void clear(JwtUserPrincipal principal) {
        cartItemRepository.deleteByUserId(principal.getId());
    }

    private int getOnlineStock(Long productId) {
        return inventoryItemRepository.findByProductId(productId)
                .map(InventoryItem::getOnlineStock)
                .orElse(0);
    }

    private CartItemDto toDto(CartItem item) {
        Product product = productRepository.findById(item.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + item.getProductId()));

        int stock = getOnlineStock(product.getId());

        return new CartItemDto(
                item.getId(),
                product.getId(),
                product.getSku(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getCategory(),
                product.getPlantingMonth(),
                product.getSuitableRegion(),
                product.getImageUrl(),
                stock,
                item.getQuantity()
        );
    }
}
