package com.greenplan.api.catalog;

public enum ProductCategory {
    VEGETABLE("蔬菜种子", "VEG"),
    FLOWER("花卉种子", "FLOW"),
    HERB("草本植物", "HERB"),
    SUCCULENT("多肉植物", "SUCC"),
    TOOL("种植工具", "TOOL"),
    FERTILIZER("营养肥料", "NUTR");

    private final String label;
    private final String skuCode;

    ProductCategory(String label, String skuCode) {
        this.label = label;
        this.skuCode = skuCode;
    }

    public String getLabel() {
        return label;
    }

    public String getSkuCode() {
        return skuCode;
    }

    public static ProductCategory fromValue(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("商品品类不能为空");
        }
        for (ProductCategory c : values()) {
            if (c.name().equals(value)) {
                return c;
            }
        }
        throw new IllegalArgumentException("无效的商品品类: " + value);
    }
}
