package com.greenplan.api.reporting;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;

@Service
public class ReportingService {

    private final SalesDailySummaryRepository repository;

    public ReportingService(SalesDailySummaryRepository repository) {
        this.repository = repository;
    }

    public Map<String, Object> overview() {
        var rows = repository.findAll();
        int totalOrders = rows.stream().mapToInt(SalesDailySummary::getOrdersCount).sum();
        int totalUnits = rows.stream().mapToInt(SalesDailySummary::getUnitsSold).sum();
        BigDecimal grossSales = rows.stream().map(SalesDailySummary::getGrossSales)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return Map.of(
                "totalOrders", totalOrders,
                "totalUnits", totalUnits,
                "grossSales", grossSales,
                "days", rows.size()
        );
    }
}
