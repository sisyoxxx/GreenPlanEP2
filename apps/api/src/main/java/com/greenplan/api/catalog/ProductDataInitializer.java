package com.greenplan.api.catalog;

import com.greenplan.api.inventory.InventoryItem;
import com.greenplan.api.inventory.InventoryItemRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Component
public class ProductDataInitializer implements ApplicationRunner {

    private final ProductRepository productRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final boolean productsSeedEnabled;

    public ProductDataInitializer(
            ProductRepository productRepository,
            InventoryItemRepository inventoryItemRepository,
            @Value("${app.seed.products-enabled:false}") boolean productsSeedEnabled
    ) {
        this.productRepository = productRepository;
        this.inventoryItemRepository = inventoryItemRepository;
        this.productsSeedEnabled = productsSeedEnabled;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!productsSeedEnabled) {
            return;
        }

        seedProduct(
                "SEED-TOMATO-002",
                "Cherry Tomato Seeds",
                "Great for balcony planters, productive and beginner friendly.",
                new BigDecimal("9.90"),
                "VEGETABLE",
                "Spring",
                "East China",
                "https://source.unsplash.com/1200x900/?tomato,seed",
                120,
                15,
                "Cherry Tomato",
                "Shouguang, Shandong",
                new BigDecimal("93.00")
        );
        seedProduct(
                "SEED-CUCUMBER-001",
                "Cucumber Seeds",
                "Fast summer growth, ideal for patio containers and home gardens.",
                new BigDecimal("8.80"),
                "VEGETABLE",
                "Summer",
                "Central China",
                "https://source.unsplash.com/1200x900/?cucumber,garden",
                110,
                12,
                "Cucumber",
                "Zhoukou, Henan",
                new BigDecimal("91.00")
        );
        seedProduct(
                "SEED-LETTUCE-001",
                "Lettuce Seeds",
                "Quick sprouting and easy maintenance for small spaces.",
                new BigDecimal("8.50"),
                "VEGETABLE",
                "Autumn",
                "North China",
                "https://source.unsplash.com/1200x900/?lettuce,seedling",
                96,
                12,
                "Butter Lettuce",
                "Langfang, Hebei",
                new BigDecimal("95.00")
        );
        seedProduct(
                "SEED-PEPPER-001",
                "Bell Pepper Seeds",
                "Colorful fruits, suitable for sunny balconies and containers.",
                new BigDecimal("10.80"),
                "VEGETABLE",
                "Spring",
                "South China",
                "https://source.unsplash.com/1200x900/?bell-pepper,plant",
                72,
                10,
                "Bell Pepper",
                "Nanning, Guangxi",
                new BigDecimal("90.00")
        );
        seedProduct(
                "SEED-BASIL-001",
                "Basil Seeds",
                "Rich aroma and continuous harvest for kitchen windowsills.",
                new BigDecimal("6.80"),
                "HERB",
                "Winter",
                "South China",
                "https://source.unsplash.com/1200x900/?basil,herb",
                88,
                10,
                "Sweet Basil",
                "Kunming, Yunnan",
                new BigDecimal("92.00")
        );
        seedProduct(
                "SEED-MINT-001",
                "Mint Seeds",
                "Vigorous growth and simple care for daily home use.",
                new BigDecimal("6.50"),
                "HERB",
                "Winter",
                "All Regions",
                "https://source.unsplash.com/1200x900/?mint,plant",
                92,
                10,
                "Spearmint",
                "Chengdu, Sichuan",
                new BigDecimal("89.00")
        );
        seedProduct(
                "SEED-SUNFLOWER-001",
                "Sunflower Seeds",
                "Bright flowers that quickly elevate the mood of your garden.",
                new BigDecimal("12.50"),
                "FLOWER",
                "Spring",
                "North China",
                "https://source.unsplash.com/1200x900/?sunflower,garden",
                64,
                8,
                "Ornamental Sunflower",
                "Chifeng, Inner Mongolia",
                new BigDecimal("88.00")
        );
        seedProduct(
                "SEED-LAVENDER-001",
                "Lavender Seeds",
                "Fragrant blooms with excellent ornamental value.",
                new BigDecimal("13.80"),
                "FLOWER",
                "Autumn",
                "Southwest China",
                "https://source.unsplash.com/1200x900/?lavender,flower",
                58,
                8,
                "Lavender",
                "Dali, Yunnan",
                new BigDecimal("86.00")
        );
        seedProduct(
                "SEED-STRAWBERRY-001",
                "Strawberry Seeds",
                "Great for home fruit-growing experiences on balconies.",
                new BigDecimal("16.90"),
                "HERB",
                "Spring",
                "East China",
                "https://source.unsplash.com/1200x900/?strawberry,plant",
                48,
                6,
                "Everbearing Strawberry",
                "Dandong, Liaoning",
                new BigDecimal("87.00")
        );
        seedProduct(
                "TOOL-SPRAYER-001",
                "Garden Sprayer",
                "Fine mist for seedling watering and leaf moisture care.",
                new BigDecimal("19.90"),
                "TOOL",
                "All Year",
                "All Regions",
                "https://source.unsplash.com/1200x900/?gardening,spray-bottle",
                42,
                5,
                "Standard Sprayer",
                "Taizhou, Zhejiang",
                new BigDecimal("100.00")
        );
        seedProduct(
                "FERTILIZER-NUTRIENT-001",
                "General Nutrient Fertilizer",
                "Slow-release formula for vegetables and flowers.",
                new BigDecimal("29.90"),
                "FERTILIZER",
                "All Year",
                "All Regions",
                "https://images.pexels.com/photos/30801526/pexels-photo-30801526.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
                66,
                8,
                "Slow-release Fertilizer",
                "Linyi, Shandong",
                new BigDecimal("100.00")
        );
        seedProduct(
                "SUCCULENT-SET-001",
                "Succulent Plant Set (3pcs)",
                "Low-maintenance desktop and windowsill succulent combination.",
                new BigDecimal("39.90"),
                "SUCCULENT",
                "All Year",
                "All Regions",
                "https://images.pexels.com/photos/1400375/pexels-photo-1400375.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
                54,
                6,
                "Mixed Succulent Set",
                "Kunming, Yunnan",
                new BigDecimal("85.00")
        );
    }

    private void seedProduct(
            String sku,
            String name,
            String description,
            BigDecimal price,
            String category,
            String plantingMonth,
            String suitableRegion,
            String imageUrl,
            int onlineStock,
            int warningThreshold,
            String variety,
            String origin,
            BigDecimal germinationRate
    ) {
        Product product = productRepository.findBySku(sku).orElseGet(Product::new);
        product.setSku(sku);
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setStatus("PUBLISHED");
        product.setCategory(category);
        product.setVariety(variety);
        product.setPlantingMonth(plantingMonth);
        product.setSuitableRegion(suitableRegion);
        product.setOrigin(origin);
        product.setGerminationRate(germinationRate);
        product.setImageUrl(imageUrl);

        Product saved = productRepository.save(product);

        InventoryItem inventoryItem = inventoryItemRepository.findByProductId(saved.getId()).orElseGet(InventoryItem::new);
        inventoryItem.setProduct(saved);
        inventoryItem.setOnlineStock(onlineStock);
        inventoryItem.setWarningThreshold(warningThreshold);
        inventoryItemRepository.save(inventoryItem);
    }
}
