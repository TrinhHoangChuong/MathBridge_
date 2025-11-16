package com.mathbridge.controller.PortalAdmin;

import com.mathbridge.dto.PortalAdmin.Response.DashboardResponse;
import com.mathbridge.service.PortalAdmin.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/portal/admin/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard() {
        DashboardResponse response = dashboardService.getDashboardOverview();
        return ResponseEntity.ok(response);
    }
}
