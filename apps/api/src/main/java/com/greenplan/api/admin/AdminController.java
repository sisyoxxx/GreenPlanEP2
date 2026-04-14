package com.greenplan.api.admin;

import com.greenplan.api.common.ApiResponse;
import com.greenplan.api.security.JwtUserPrincipal;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/announcements")
    public ApiResponse<List<Announcement>> announcements() {
        return ApiResponse.ok(adminService.listAnnouncements());
    }

    @PostMapping("/admin/announcements")
    public ApiResponse<Announcement> createAnnouncement(@Valid @RequestBody AnnouncementRequest request, Authentication authentication) {
        return ApiResponse.ok("公告发布成功", adminService.createAnnouncement(request, (JwtUserPrincipal) authentication.getPrincipal()));
    }

    @GetMapping("/promotions")
    public ApiResponse<List<Promotion>> promotions() {
        return ApiResponse.ok(adminService.listPromotions());
    }

    @PostMapping("/admin/promotions")
    public ApiResponse<Promotion> createPromotion(@Valid @RequestBody PromotionRequest request, Authentication authentication) {
        return ApiResponse.ok("促销策略发布成功", adminService.createPromotion(request, (JwtUserPrincipal) authentication.getPrincipal()));
    }

    @PostMapping("/admin/promotion-posts")
    public ApiResponse<PromotionPost> createPost(@Valid @RequestBody PromotionPostRequest request, Authentication authentication) {
        return ApiResponse.ok("推文发布成功", adminService.createPromotionPost(request, (JwtUserPrincipal) authentication.getPrincipal()));
    }
}
