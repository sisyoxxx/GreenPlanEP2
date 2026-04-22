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

    @PutMapping("/admin/announcements/{announcementId}")
    public ApiResponse<Announcement> updateAnnouncement(
            @PathVariable Long announcementId,
            @Valid @RequestBody AnnouncementRequest request,
            Authentication authentication
    ) {
        return ApiResponse.ok(
                "Announcement updated",
                adminService.updateAnnouncement(announcementId, request, (JwtUserPrincipal) authentication.getPrincipal())
        );
    }

    @DeleteMapping("/admin/announcements/{announcementId}")
    public ApiResponse<Void> deleteAnnouncement(
            @PathVariable Long announcementId,
            Authentication authentication
    ) {
        adminService.deleteAnnouncement(announcementId, (JwtUserPrincipal) authentication.getPrincipal());
        return ApiResponse.ok("Announcement deleted", null);
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

    @PutMapping("/admin/promotions/{promotionId}")
    public ApiResponse<Promotion> updatePromotion(
            @PathVariable Long promotionId,
            @Valid @RequestBody PromotionRequest request,
            Authentication authentication
    ) {
        return ApiResponse.ok(
                "Promotion updated",
                adminService.updatePromotion(promotionId, request, (JwtUserPrincipal) authentication.getPrincipal())
        );
    }

    @DeleteMapping("/admin/promotions/{promotionId}")
    public ApiResponse<Void> deletePromotion(
            @PathVariable Long promotionId,
            Authentication authentication
    ) {
        adminService.deletePromotion(promotionId, (JwtUserPrincipal) authentication.getPrincipal());
        return ApiResponse.ok("Promotion deleted", null);
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
