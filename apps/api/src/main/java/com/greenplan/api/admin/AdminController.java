package com.greenplan.api.admin;

import com.greenplan.api.common.ApiResponse;
import com.greenplan.api.security.SecurityUtils;
import jakarta.validation.Valid;
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
    public ApiResponse<Announcement> createAnnouncement(@Valid @RequestBody AnnouncementRequest request) {
        return ApiResponse.ok("Announcement created", adminService.createAnnouncement(request, SecurityUtils.requirePrincipal()));
    }

    @PutMapping("/admin/announcements/{announcementId}")
    public ApiResponse<Announcement> updateAnnouncement(
            @PathVariable Long announcementId,
            @Valid @RequestBody AnnouncementRequest request
    ) {
        return ApiResponse.ok(
                "Announcement updated",
                adminService.updateAnnouncement(announcementId, request, SecurityUtils.requirePrincipal())
        );
    }

    @DeleteMapping("/admin/announcements/{announcementId}")
    public ApiResponse<Void> deleteAnnouncement(@PathVariable Long announcementId) {
        adminService.deleteAnnouncement(announcementId, SecurityUtils.requirePrincipal());
        return ApiResponse.ok("Announcement deleted", null);
    }

    @GetMapping("/promotions")
    public ApiResponse<List<Promotion>> promotions() {
        return ApiResponse.ok(adminService.listPromotions());
    }

    @PostMapping("/admin/promotions")
    public ApiResponse<Promotion> createPromotion(@Valid @RequestBody PromotionRequest request) {
        return ApiResponse.ok("Promotion created", adminService.createPromotion(request, SecurityUtils.requirePrincipal()));
    }

    @PutMapping("/admin/promotions/{promotionId}")
    public ApiResponse<Promotion> updatePromotion(
            @PathVariable Long promotionId,
            @Valid @RequestBody PromotionRequest request
    ) {
        return ApiResponse.ok(
                "Promotion updated",
                adminService.updatePromotion(promotionId, request, SecurityUtils.requirePrincipal())
        );
    }

    @DeleteMapping("/admin/promotions/{promotionId}")
    public ApiResponse<Void> deletePromotion(@PathVariable Long promotionId) {
        adminService.deletePromotion(promotionId, SecurityUtils.requirePrincipal());
        return ApiResponse.ok("Promotion deleted", null);
    }

    @GetMapping("/promotion-posts")
    public ApiResponse<List<PromotionPost>> promotionPosts() {
        return ApiResponse.ok(adminService.listPromotionPosts());
    }

    @PostMapping("/admin/promotion-posts")
    public ApiResponse<PromotionPost> createPost(@Valid @RequestBody PromotionPostRequest request) {
        return ApiResponse.ok("Promotion post created", adminService.createPromotionPost(request, SecurityUtils.requirePrincipal()));
    }

    @PutMapping("/admin/promotion-posts/{postId}")
    public ApiResponse<PromotionPost> updatePost(
            @PathVariable Long postId,
            @Valid @RequestBody PromotionPostRequest request
    ) {
        return ApiResponse.ok("Promotion post updated", adminService.updatePromotionPost(postId, request, SecurityUtils.requirePrincipal()));
    }

    @DeleteMapping("/admin/promotion-posts/{postId}")
    public ApiResponse<Void> deletePost(@PathVariable Long postId) {
        adminService.deletePromotionPost(postId, SecurityUtils.requirePrincipal());
        return ApiResponse.ok("Promotion post deleted", null);
    }
}
