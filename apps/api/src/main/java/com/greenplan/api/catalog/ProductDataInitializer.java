package com.greenplan.api.catalog;

import com.greenplan.api.inventory.InventoryItem;
import com.greenplan.api.inventory.InventoryItemRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Component
public class ProductDataInitializer implements ApplicationRunner {

    private final ProductRepository productRepository;
    private final InventoryItemRepository inventoryItemRepository;

    public ProductDataInitializer(ProductRepository productRepository, InventoryItemRepository inventoryItemRepository) {
        this.productRepository = productRepository;
        this.inventoryItemRepository = inventoryItemRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedProduct(
                "SEED-TOMATO-002",
                "樱桃番茄种子",
                "适合家庭阳台盆栽，果实小巧饱满，附带新手播种建议。",
                new BigDecimal("9.90"),
                "VEGETABLE",
                "春播",
                "华东",
                "https://source.unsplash.com/1200x900/?tomato,seed",
                120,
                15
        );
        seedProduct(
                "SEED-CUCUMBER-001",
                "黄瓜种子",
                "夏季生长势旺，适合庭院和大花盆种植，采收期稳定。",
                new BigDecimal("8.80"),
                "VEGETABLE",
                "夏播",
                "华中",
                "https://source.unsplash.com/1200x900/?cucumber,garden",
                110,
                12
        );
        seedProduct(
                "SEED-LETTUCE-001",
                "生菜种子",
                "发芽快、管理简单，适合新手入门和阳台小空间种植。",
                new BigDecimal("8.50"),
                "VEGETABLE",
                "秋播",
                "华北",
                "https://source.unsplash.com/1200x900/?lettuce,seedling",
                96,
                12
        );
        seedProduct(
                "SEED-PEPPER-001",
                "彩椒种子",
                "果色丰富，适合光照充足的阳台环境，观赏和食用兼顾。",
                new BigDecimal("10.80"),
                "VEGETABLE",
                "春播",
                "华南",
                "https://source.unsplash.com/1200x900/?bell-pepper,plant",
                72,
                10
        );
        seedProduct(
                "SEED-BASIL-001",
                "罗勒种子",
                "适合厨房窗台和香草角落，香味浓郁，适合日常采摘。",
                new BigDecimal("6.80"),
                "HERB",
                "冬季",
                "华南",
                "https://source.unsplash.com/1200x900/?basil,herb",
                88,
                10
        );
        seedProduct(
                "SEED-MINT-001",
                "薄荷种子",
                "生长迅速、好打理，适合做家庭常备草本盆栽。",
                new BigDecimal("6.50"),
                "HERB",
                "冬季",
                "通用",
                "https://source.unsplash.com/1200x900/?mint,plant",
                92,
                10
        );
        seedProduct(
                "SEED-SUNFLOWER-001",
                "向日葵种子",
                "花型明亮，适合打造阳台和庭院的季节氛围感。",
                new BigDecimal("12.50"),
                "FLOWER",
                "春播",
                "华北",
                "https://source.unsplash.com/1200x900/?sunflower,garden",
                64,
                8
        );
        seedProduct(
                "SEED-LAVENDER-001",
                "薰衣草种子",
                "适合打造芳香花园，秋播后更利于来年成型。",
                new BigDecimal("13.80"),
                "FLOWER",
                "秋播",
                "西南",
                "https://source.unsplash.com/1200x900/?lavender,flower",
                58,
                8
        );
        seedProduct(
                "SEED-STRAWBERRY-001",
                "草莓种子",
                "适合家庭阳台体验结果乐趣，也适合作为草本类果实种植体验。",
                new BigDecimal("16.90"),
                "HERB",
                "春播",
                "华东",
                "https://source.unsplash.com/1200x900/?strawberry,plant",
                48,
                6
        );
        seedProduct(
                "TOOL-SPRAYER-001",
                "园艺喷壶",
                "细雾均匀，适合幼苗期补水、叶面保湿和日常养护。",
                new BigDecimal("19.90"),
                "TOOL",
                "冬季",
                "通用",
                "https://source.unsplash.com/1200x900/?gardening,spray-bottle",
                42,
                5
        );

        // User requested: add fertilizer + succulent products with online image links.
        seedProduct(
                "FERTILIZER-NUTRIENT-001",
                "通用营养肥料（缓释型）",
                "适合阳台蔬菜和花卉的通用营养补给，缓释配方更省心，适合新手稳定追肥。",
                new BigDecimal("29.90"),
                "FERTILIZER",
                "全年",
                "通用",
                "https://images.pexels.com/photos/30801526/pexels-photo-30801526.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
                66,
                8
        );
        seedProduct(
                "SUCCULENT-SET-001",
                "多肉植物组合（3株）",
                "精选耐养多肉组合，适合办公桌和窗台，低维护、观赏性强，附基础养护建议。",
                new BigDecimal("39.90"),
                "SUCCULENT",
                "全年",
                "通用",
                "https://images.pexels.com/photos/1400375/pexels-photo-1400375.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
                54,
                6
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
            int warningThreshold
    ) {
        Product product = productRepository.findBySku(sku).orElseGet(Product::new);
        product.setSku(sku);
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setStatus("PUBLISHED");
        product.setCategory(category);
        product.setPlantingMonth(plantingMonth);
        product.setSuitableRegion(suitableRegion);
        product.setImageUrl(imageUrl);

        Product saved = productRepository.save(product);

        InventoryItem inventoryItem = inventoryItemRepository.findByProductId(saved.getId()).orElseGet(InventoryItem::new);
        inventoryItem.setProduct(saved);
        inventoryItem.setOnlineStock(onlineStock);
        inventoryItem.setWarningThreshold(warningThreshold);
        inventoryItemRepository.save(inventoryItem);
    }
}
