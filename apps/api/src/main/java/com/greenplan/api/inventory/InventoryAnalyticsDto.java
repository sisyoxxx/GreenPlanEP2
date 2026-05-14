package com.greenplan.api.inventory;

import java.math.BigDecimal;
import java.util.List;

public record InventoryAnalyticsDto(
        List<ProductOutboundStat> outboundByProduct,
        List<DailyTrend> dailyTrend,
        int inboundTotalThisMonth,
        int outboundTotalThisMonth,
        int currentTotalStock
) {
    public record ProductOutboundStat(
            Long productId,
            String sku,
            String name,
            int totalQty
    ) {}

    public record DailyTrend(
            String date,
            int inbound,
            int outbound
    ) {}
}
