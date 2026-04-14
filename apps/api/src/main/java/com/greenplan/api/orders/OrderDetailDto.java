package com.greenplan.api.orders;

import java.math.BigDecimal;
import java.util.List;

public record OrderDetailDto(
        Long id,
        String orderNo,
        String status,
        BigDecimal totalAmount,
        List<OrderItemDto> items
) {
}
