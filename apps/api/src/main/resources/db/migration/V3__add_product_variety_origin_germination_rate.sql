ALTER TABLE products
  ADD COLUMN variety VARCHAR(64) NULL AFTER category,
  ADD COLUMN origin_place VARCHAR(64) NULL AFTER suitable_region,
  ADD COLUMN germination_rate DECIMAL(5,2) NULL AFTER origin_place;

UPDATE products
SET
  variety = CASE
    WHEN variety IS NOT NULL AND variety <> '' THEN variety
    WHEN sku IN ('SEED-TOMATO-001', 'SEED-TOMATO-002') THEN 'Cherry Tomato'
    WHEN sku = 'SEED-CUCUMBER-001' THEN 'Cucumber'
    WHEN sku = 'SEED-LETTUCE-001' THEN 'Butter Lettuce'
    WHEN sku = 'SEED-PEPPER-001' THEN 'Bell Pepper'
    WHEN sku = 'SEED-BASIL-001' THEN 'Sweet Basil'
    WHEN sku = 'SEED-MINT-001' THEN 'Spearmint'
    WHEN sku = 'SEED-SUNFLOWER-001' THEN 'Ornamental Sunflower'
    WHEN sku = 'SEED-LAVENDER-001' THEN 'Lavender'
    WHEN sku = 'SEED-STRAWBERRY-001' THEN 'Everbearing Strawberry'
    WHEN sku = 'TOOL-SPRAYER-001' THEN 'Standard Sprayer'
    WHEN sku = 'FERTILIZER-NUTRIENT-001' THEN 'Slow-release Fertilizer'
    WHEN sku = 'SUCCULENT-SET-001' THEN 'Mixed Succulent Set'
    ELSE 'Standard Variety'
  END,
  origin_place = CASE
    WHEN origin_place IS NOT NULL AND origin_place <> '' THEN origin_place
    WHEN sku IN ('SEED-TOMATO-001', 'SEED-TOMATO-002') THEN 'Shouguang, Shandong'
    WHEN sku = 'SEED-CUCUMBER-001' THEN 'Zhoukou, Henan'
    WHEN sku = 'SEED-LETTUCE-001' THEN 'Langfang, Hebei'
    WHEN sku = 'SEED-PEPPER-001' THEN 'Nanning, Guangxi'
    WHEN sku = 'SEED-BASIL-001' THEN 'Kunming, Yunnan'
    WHEN sku = 'SEED-MINT-001' THEN 'Chengdu, Sichuan'
    WHEN sku = 'SEED-SUNFLOWER-001' THEN 'Chifeng, Inner Mongolia'
    WHEN sku = 'SEED-LAVENDER-001' THEN 'Dali, Yunnan'
    WHEN sku = 'SEED-STRAWBERRY-001' THEN 'Dandong, Liaoning'
    WHEN sku = 'TOOL-SPRAYER-001' THEN 'Taizhou, Zhejiang'
    WHEN sku = 'FERTILIZER-NUTRIENT-001' THEN 'Linyi, Shandong'
    WHEN sku = 'SUCCULENT-SET-001' THEN 'Kunming, Yunnan'
    ELSE 'China'
  END,
  germination_rate = CASE
    WHEN germination_rate IS NOT NULL THEN germination_rate
    WHEN sku IN ('SEED-TOMATO-001', 'SEED-TOMATO-002') THEN 93.00
    WHEN sku = 'SEED-CUCUMBER-001' THEN 91.00
    WHEN sku = 'SEED-LETTUCE-001' THEN 95.00
    WHEN sku = 'SEED-PEPPER-001' THEN 90.00
    WHEN sku = 'SEED-BASIL-001' THEN 92.00
    WHEN sku = 'SEED-MINT-001' THEN 89.00
    WHEN sku = 'SEED-SUNFLOWER-001' THEN 88.00
    WHEN sku = 'SEED-LAVENDER-001' THEN 86.00
    WHEN sku = 'SEED-STRAWBERRY-001' THEN 87.00
    WHEN sku = 'TOOL-SPRAYER-001' THEN 100.00
    WHEN sku = 'FERTILIZER-NUTRIENT-001' THEN 100.00
    WHEN sku = 'SUCCULENT-SET-001' THEN 85.00
    ELSE 85.00
  END;
