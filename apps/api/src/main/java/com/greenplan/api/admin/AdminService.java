package com.greenplan.api.admin;

import com.greenplan.api.auth.RoleCode;
import com.greenplan.api.security.JwtUserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

@Service
public class AdminService {

    private static final Set<String> ALLOWED_POST_CHANNELS = Set.of("community", "home", "product");

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
        return announcementRepository.findAll().stream()
                .sorted(Comparator.comparing(Announcement::getPublishedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    public List<Promotion> listPromotions() {
        return promotionRepository.findAll().stream()
                .sorted(Comparator.comparing(Promotion::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    public List<PromotionPost> listPromotionPosts() {
        return postRepository.findAll().stream()
                .sorted(Comparator.comparing(PromotionPost::getPublishedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
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
    public Announcement updateAnnouncement(Long announcementId, AnnouncementRequest request, JwtUserPrincipal principal) {
        ensureAdmin(principal);
        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new IllegalArgumentException("Announcement not found"));
        ensurePublishedAnnouncement(announcement);
        announcement.setTitle(request.title());
        announcement.setContent(request.content());
        announcement.setPublishedAt(LocalDateTime.now());
        return announcementRepository.save(announcement);
    }

    @Transactional
    public void deleteAnnouncement(Long announcementId, JwtUserPrincipal principal) {
        ensureAdmin(principal);
        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new IllegalArgumentException("Announcement not found"));
        ensurePublishedAnnouncement(announcement);
        announcementRepository.delete(announcement);
    }

    @Transactional
    public Promotion createPromotion(PromotionRequest request, JwtUserPrincipal principal) {
        ensureAdmin(principal);
        Promotion promotion = new Promotion();
        promotion.setTitle(request.title());
        promotion.setStrategyType(request.strategyType());
        promotion.setDescription(request.description());
        promotion.setImageUrl(request.imageUrl());
        promotion.setStatus("PUBLISHED");
        promotion.setCreatedBy(principal.getId());
        return promotionRepository.save(promotion);
    }

    @Transactional
    public Promotion updatePromotion(Long promotionId, PromotionRequest request, JwtUserPrincipal principal) {
        ensureAdmin(principal);
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new IllegalArgumentException("Promotion not found"));
        ensurePublishedPromotion(promotion);
        promotion.setTitle(request.title());
        promotion.setStrategyType(request.strategyType());
        promotion.setDescription(request.description());
        promotion.setImageUrl(request.imageUrl());
        promotion.setStatus("PUBLISHED");
        return promotionRepository.save(promotion);
    }

    @Transactional
    public void deletePromotion(Long promotionId, JwtUserPrincipal principal) {
        ensureAdmin(principal);
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new IllegalArgumentException("Promotion not found"));
        ensurePublishedPromotion(promotion);
        promotionRepository.delete(promotion);
    }

    @Transactional
    public PromotionPost createPromotionPost(PromotionPostRequest request, JwtUserPrincipal principal) {
        ensureAdmin(principal);
        String channel = normalizeChannel(request.channel());
        validatePostChannel(channel);
        PromotionPost post = new PromotionPost();
        post.setPromotionId(request.promotionId());
        post.setChannel(channel);
        post.setContent(request.content());
        post.setImageUrl(normalizeBlankToNull(request.imageUrl()));
        post.setPostStatus("PUBLISHED");
        post.setPublishedAt(LocalDateTime.now());
        post.setCreatedBy(principal.getId());
        return postRepository.save(post);
    }

    @Transactional
    public PromotionPost updatePromotionPost(Long postId, PromotionPostRequest request, JwtUserPrincipal principal) {
        ensureAdmin(principal);
        String channel = normalizeChannel(request.channel());
        validatePostChannel(channel);
        PromotionPost post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Promotion post not found"));
        post.setPromotionId(request.promotionId());
        post.setChannel(channel);
        post.setContent(request.content());
        post.setImageUrl(normalizeBlankToNull(request.imageUrl()));
        post.setPostStatus("PUBLISHED");
        post.setPublishedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    @Transactional
    public void deletePromotionPost(Long postId, JwtUserPrincipal principal) {
        ensureAdmin(principal);
        PromotionPost post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Promotion post not found"));
        postRepository.delete(post);
    }

    private void ensureAdmin(JwtUserPrincipal principal) {
        if (principal.getRole() != RoleCode.ADMIN) {
            throw new IllegalArgumentException("Only admin can perform this action");
        }
    }

    private void validatePostChannel(String channel) {
        if (!ALLOWED_POST_CHANNELS.contains(channel)) {
            throw new IllegalArgumentException("Unsupported promotion post channel");
        }
    }

    private void ensurePublishedAnnouncement(Announcement announcement) {
        if (!"PUBLISHED".equalsIgnoreCase(announcement.getStatus())) {
            throw new IllegalArgumentException("Only published announcements can be edited or deleted");
        }
    }

    private void ensurePublishedPromotion(Promotion promotion) {
        if (!"PUBLISHED".equalsIgnoreCase(promotion.getStatus())) {
            throw new IllegalArgumentException("Only published promotions can be edited or deleted");
        }
    }

    private static String normalizeChannel(String channel) {
        return channel == null ? "" : channel.trim().toLowerCase();
    }

    private static String normalizeBlankToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
