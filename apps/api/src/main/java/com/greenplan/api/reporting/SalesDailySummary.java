package com.greenplan.api.reporting;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "sales_daily_summary")
public class SalesDailySummary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "biz_date", nullable = false, unique = true)
    private LocalDate bizDate;

    @Column(name = "orders_count", nullable = false)
    private Integer ordersCount;

    @Column(name = "units_sold", nullable = false)
    private Integer unitsSold;

    @Column(name = "gross_sales", nullable = false, precision = 10, scale = 2)
    private BigDecimal grossSales;

    @Column(name = "generated_at", insertable = false, updatable = false)
    private LocalDateTime generatedAt;
}
