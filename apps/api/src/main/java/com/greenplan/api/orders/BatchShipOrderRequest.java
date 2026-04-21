package com.greenplan.api.orders;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record BatchShipOrderRequest(
        @NotEmpty List<Long> orderIds
) {
}
