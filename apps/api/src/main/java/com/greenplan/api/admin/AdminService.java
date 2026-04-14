package com.greenplan.api.admin;

import com.greenplan.api.auth.RoleCode;
import com.greenplan.api.security.JwtUserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminService {

    private final AnnouncementRepository announcementRepository;
    private final PromotionRepository promotionRepository;
    private final PromotionPostRepository postRepository;

    public AdminService(AnnouncementRepository announcementRepository,
                        PromotionRepository promotionRepository,
                        PromotionPostRepository postRepository) {
        this.announcementRepository = announcementRepository;
        this.promotionRepository = promotionRepository;
        this.postRepository = postRepository;
    }

    public List<Announcement> listAnnouncements() {
        return announcementRepository.findAll();
    }

    public List<Promotion> listPromotions() {
        return promotionRepository.findAll();
    }

    @Transactional
    public Announcement createAnnouncement(AnnouncementRequest request, JwtUserPrincipal principal) {
        ensureAdmin(principal);
        Announcement announcement = new Announcement();
        announcement.setTitle(request.title());
        announcement.setContent(request.content());
        announcement.setStatus("PUBLISHED");
        announcement.setPublishedAt(LocalDateTime.now());
        announcement.setCreatedBy(principal.getId());
        return announcementRepository.save(announcement);
    }

    @Transactional
    public Promotion createPromotion(PromotionRequest request, JwtUserPrincipal principal) {
        ensureAdmin(principal);
        Promotion promotion = new Promotion();
        promotion.setTitle(request.title());
        promotion.setStrategyType(request.strategyType());
        promotion.setDescription(request.description());
        promotion.setStatus("PUBLISHED");
        promotion.setCreatedBy(principal.getId());
        return promotionRepository.save(promotion);
    }

    @Transactional
    public PromotionPost createPromotionPost(PromotionPostRequest request, JwtUserPrincipal principal) {
        ensureAdmin(principal);
        PromotionPost post = new PromotionPost();
        post.setPromotionId(request.promotionId());
        post.setChannel(request.channel());
        post.setContent(request.content());
        post.setPostStatus("PUBLISHED");
        post.setPublishedAt(LocalDateTime.now());
        post.setCreatedBy(principal.getId());
        return postRepository.save(post);
    }

    private void ensureAdmin(JwtUserPrincipal principal) {
        if (principal.getRole() != RoleCode.ADMIN) {
            throw new IllegalArgumentException("仅管理员可执行该操作");
        }
    }
}
