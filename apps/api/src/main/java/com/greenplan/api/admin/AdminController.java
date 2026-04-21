package com.greenplan.api.admin;

import com.greenplan.api.common.ApiResponse;
import com.greenplan.api.security.JwtUserPrincipal;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    public ApiResponse<Announcement> createAnnouncement(
            @Valid @RequestBody AnnouncementRequest request,
            Authentication authentication
    ) {
        return ApiResponse.ok("Announcement created", adminService.createAnnouncement(request, (JwtUserPrincipal) authentication.getPrincipal()));
    }

    @GetMapping("/promotions")
    public ApiResponse<List<Promotion>> promotions() {
        return ApiResponse.ok(adminService.listPromotions());
    }

    @PostMapping("/admin/promotions")
    public ApiResponse<Promotion> createPromotion(
            @Valid @RequestBody PromotionRequest request,
            Authentication authentication
    ) {
        return ApiResponse.ok("Promotion created", adminService.createPromotion(request, (JwtUserPrincipal) authentication.getPrincipal()));
    }

    @GetMapping("/promotion-posts")
    public ApiResponse<List<PromotionPost>> promotionPosts() {
        return ApiResponse.ok(adminService.listPromotionPosts());
    }

    @PostMapping("/admin/promotion-posts")
    public ApiResponse<PromotionPost> createPost(
            @Valid @RequestBody PromotionPostRequest request,
            Authentication authentication
    ) {
        return ApiResponse.ok("Promotion post created", adminService.createPromotionPost(request, (JwtUserPrincipal) authentication.getPrincipal()));
    }

    @PutMapping("/admin/promotion-posts/{postId}")
    public ApiResponse<PromotionPost> updatePost(
            @PathVariable Long postId,
            @Valid @RequestBody PromotionPostRequest request,
            Authentication authentication
    ) {
        return ApiResponse.ok("Promotion post updated", adminService.updatePromotionPost(postId, request, (JwtUserPrincipal) authentication.getPrincipal()));
    }

    @DeleteMapping("/admin/promotion-posts/{postId}")
    public ApiResponse<Void> deletePost(
            @PathVariable Long postId,
            Authentication authentication
    ) {
        adminService.deletePromotionPost(postId, (JwtUserPrincipal) authentication.getPrincipal());
        return ApiResponse.ok("Promotion post deleted", null);
    }
}
