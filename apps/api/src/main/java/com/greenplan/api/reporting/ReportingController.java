package com.greenplan.api.reporting;

import com.greenplan.api.common.ApiResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/reports/sales")
public class ReportingController {

    private final ReportingService reportingService;

    public ReportingController(ReportingService reportingService) {
        this.reportingService = reportingService;
    }

    @GetMapping("/overview")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Map<String, Object>> overview() {
        return ApiResponse.ok(reportingService.overview());
    }
}
