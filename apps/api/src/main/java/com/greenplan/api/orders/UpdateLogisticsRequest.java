package com.greenplan.api.orders;

import jakarta.validation.constraints.NotBlank;

public record UpdateLogisticsRequest(
        @NotBlank String shippingStatus
) {
}

