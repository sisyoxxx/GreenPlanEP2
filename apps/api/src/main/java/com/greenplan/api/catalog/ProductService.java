package com.greenplan.api.catalog;

import com.greenplan.api.common.ProductStatus;
import com.greenplan.api.inventory.InventoryItem;
import com.greenplan.api.inventory.InventoryItemRepository;
import com.greenplan.api.orders.OrderItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {

    private static final int DEFAULT_WARNING_THRESHOLD = 5;

    private final ProductRepository productRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final OrderItemRepository orderItemRepository;

    public ProductService(
            ProductRepository productRepository,
            InventoryItemRepository inventoryItemRepository,
            OrderItemRepository orderItemRepository
    ) {
        this.productRepository = productRepository;
        this.inventoryItemRepository = inventoryItemRepository;
        this.orderItemRepository = orderItemRepository;
    }

    public List<ProductDto> listPublished() {
        return productRepository.findAll().stream()
                .filter(product -> ProductStatus.PUBLISHED.name().equals(product.getStatus()))
                .map(this::toDto)
                .toList();
    }

    public List<ProductDto> listAll() {
        return productRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public ProductDto getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        return toDto(product);
    }

    @Transactional
    public ProductDto create(ProductUpsertRequest request) {
        Product product = new Product();
        product.setSku(request.sku());
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setStatus(ProductStatus.PUBLISHED.name());
        product.setCategory(request.category());
        product.setVariety(request.variety());
        product.setPlantingMonth(request.plantingMonth());
        product.setSuitableRegion(request.suitableRegion());
        product.setOrigin(request.origin());
        product.setGerminationRate(request.germinationRate());
        product.setImageUrl(request.imageUrl());
        Product saved = productRepository.save(product);

        initializeInventory(saved, request.initialStock());

        return toDto(saved);
    }

    @Transactional
    public ProductDto update(Long id, ProductUpsertRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        product.setSku(request.sku());
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setCategory(request.category());
        product.setVariety(request.variety());
        product.setPlantingMonth(request.plantingMonth());
        product.setSuitableRegion(request.suitableRegion());
        product.setOrigin(request.origin());
        product.setGerminationRate(request.germinationRate());
        product.setImageUrl(request.imageUrl());
        Product saved = productRepository.save(product);

        if (request.initialStock() != null) {
            updateInventoryStock(saved.getId(), request.initialStock());
        }

        return toDto(saved);
    }

    @Transactional
    public void updateStatus(Long id, String status) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        product.setStatus(status);
        productRepository.save(product);
    }

    private void initializeInventory(Product product, Integer initialStock) {
        InventoryItem item = new InventoryItem();
        item.setProduct(product);
        item.setOnlineStock(initialStock == null ? 0 : Math.max(0, initialStock));
        item.setWarningThreshold(DEFAULT_WARNING_THRESHOLD);
        inventoryItemRepository.save(item);
    }

    private void updateInventoryStock(Long productId, Integer initialStock) {
        InventoryItem inventory = inventoryItemRepository.findByProductId(productId)
                .orElseGet(() -> {
                    InventoryItem item = new InventoryItem();
                    item.setWarningThreshold(DEFAULT_WARNING_THRESHOLD);
                    return item;
                });
        inventory.setOnlineStock(Math.max(0, initialStock));
        inventoryItemRepository.save(inventory);
    }

    private ProductDto toDto(Product product) {
        Integer stock = inventoryItemRepository.findByProductId(product.getId())
                .map(InventoryItem::getOnlineStock)
                .orElse(0);
        Integer sales = orderItemRepository.sumQuantityByProductId(product.getId());
        return new ProductDto(
                product.getId(),
                product.getSku(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStatus(),
                product.getCategory(),
                product.getVariety(),
                product.getPlantingMonth(),
                product.getSuitableRegion(),
                product.getOrigin(),
                product.getGerminationRate(),
                product.getImageUrl(),
                stock,
                sales == null ? 0 : sales
        );
    }
}
