package com.greenplan.api.catalog;

import com.greenplan.api.inventory.InventoryItem;
import com.greenplan.api.inventory.InventoryItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final InventoryItemRepository inventoryItemRepository;

    public ProductService(ProductRepository productRepository, InventoryItemRepository inventoryItemRepository) {
        this.productRepository = productRepository;
        this.inventoryItemRepository = inventoryItemRepository;
    }

    public List<ProductDto> listPublished() {
        return productRepository.findAll().stream()
                .filter(product -> "PUBLISHED".equals(product.getStatus()))
                .map(this::toDto)
                .toList();
    }

    public ProductDto getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("商品不存在"));
        return toDto(product);
    }

    @Transactional
    public ProductDto create(ProductUpsertRequest request) {
        Product product = new Product();
        product.setSku(request.sku());
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setStatus("PUBLISHED");
        product.setCategory(request.category());
        product.setPlantingMonth(request.plantingMonth());
        product.setSuitableRegion(request.suitableRegion());
        product.setImageUrl(request.imageUrl());
        Product saved = productRepository.save(product);

        InventoryItem item = new InventoryItem();
        item.setProduct(saved);
        item.setOnlineStock(request.initialStock() == null ? 0 : request.initialStock());
        item.setWarningThreshold(5);
        inventoryItemRepository.save(item);

        return toDto(saved);
    }

    @Transactional
    public ProductDto update(Long id, ProductUpsertRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("商品不存在"));
        product.setSku(request.sku());
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setCategory(request.category());
        product.setPlantingMonth(request.plantingMonth());
        product.setSuitableRegion(request.suitableRegion());
        product.setImageUrl(request.imageUrl());
        Product saved = productRepository.save(product);
        return toDto(saved);
    }

    @Transactional
    public void updateStatus(Long id, String status) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("商品不存在"));
        product.setStatus(status);
        productRepository.save(product);
    }

    private ProductDto toDto(Product product) {
        Integer stock = inventoryItemRepository.findByProductId(product.getId())
                .map(InventoryItem::getOnlineStock)
                .orElse(0);
        return new ProductDto(
                product.getId(),
                product.getSku(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStatus(),
                product.getCategory(),
                product.getPlantingMonth(),
                product.getSuitableRegion(),
                product.getImageUrl(),
                stock
        );
    }
}
