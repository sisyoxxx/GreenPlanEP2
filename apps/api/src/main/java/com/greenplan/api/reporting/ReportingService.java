package com.greenplan.api.reporting;

import com.greenplan.api.catalog.Product;
import com.greenplan.api.catalog.ProductRepository;
import com.greenplan.api.orders.OrderItemRepository;
import com.greenplan.api.orders.OrderRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportingService {

    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;

    public ReportingService(
            ProductRepository productRepository,
            OrderItemRepository orderItemRepository,
            OrderRepository orderRepository
    ) {
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
        this.orderRepository = orderRepository;
    }

    public Map<String, Object> overview() {
        List<Product> products = productRepository.findAll();
        Map<Long, Integer> salesByProductId = buildSalesByProductId();
        List<Map<String, Object>> productSalesRows = buildProductSalesRows(products, salesByProductId);

        int totalOrders = (int) orderRepository.count();
        int totalUnits = salesByProductId.values().stream().mapToInt(Integer::intValue).sum();
        BigDecimal grossSales = BigDecimal.ZERO;
        for (Product product : products) {
            BigDecimal price = product.getPrice();
            if (price == null) {
                continue;
            }
            int sales = salesByProductId.getOrDefault(product.getId(), 0);
            grossSales = grossSales.add(price.multiply(BigDecimal.valueOf(sales)));
        }
        grossSales = grossSales.setScale(2, RoundingMode.HALF_UP);

        BigDecimal avgOrder = totalOrders == 0
                ? BigDecimal.ZERO
                : grossSales.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP);

        String topCategory = calculateTopCategory(products, salesByProductId);
        List<Map<String, Object>> top10 = productSalesRows.stream()
                .sorted(Comparator.comparingInt((Map<String, Object> row) -> (Integer) row.get("sales")).reversed())
                .limit(10)
                .toList();
        List<Map<String, Object>> slowMoving = productSalesRows.stream()
                .filter(row -> (Integer) row.get("sales") < 5)
                .sorted(Comparator.comparingInt(row -> (Integer) row.get("sales")))
                .toList();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("totalOrders", totalOrders);
        response.put("totalUnits", totalUnits);
        response.put("grossSales", grossSales);
        response.put("avgOrder", avgOrder);
        response.put("topCategory", topCategory);
        response.put("totalProducts", products.size());
        response.put("top10", top10);
        response.put("slowMoving", slowMoving);
        return response;
    }

    private Map<Long, Integer> buildSalesByProductId() {
        Map<Long, Integer> salesByProductId = new HashMap<>();
        for (Object[] row : orderItemRepository.sumQuantityGroupByProductId()) {
            Long productId = (Long) row[0];
            Number sum = (Number) row[1];
            salesByProductId.put(productId, sum == null ? 0 : sum.intValue());
        }
        return salesByProductId;
    }

    private List<Map<String, Object>> buildProductSalesRows(List<Product> products, Map<Long, Integer> salesByProductId) {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Product product : products) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("productId", product.getId());
            row.put("name", product.getName());
            row.put("category", product.getCategory());
            row.put("sales", salesByProductId.getOrDefault(product.getId(), 0));
            rows.add(row);
        }
        return rows;
    }

    private String calculateTopCategory(List<Product> products, Map<Long, Integer> salesByProductId) {
        Map<String, Integer> categorySales = new HashMap<>();
        for (Product product : products) {
            int sales = salesByProductId.getOrDefault(product.getId(), 0);
            String category = product.getCategory() == null ? "UNKNOWN" : product.getCategory();
            categorySales.put(category, categorySales.getOrDefault(category, 0) + sales);
        }
        return categorySales.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");
    }
}
