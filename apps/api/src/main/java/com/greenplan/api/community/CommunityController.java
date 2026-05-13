package com.greenplan.api.community;

import com.greenplan.api.common.ApiResponse;
import com.greenplan.api.common.exception.AuthenticationRequiredException;
import com.greenplan.api.common.exception.PermissionDeniedException;
import com.greenplan.api.common.exception.ResourceNotFoundException;
import com.greenplan.api.security.JwtUserPrincipal;
import com.greenplan.api.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/community")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;
    private final CommunityPostCommentRepository commentRepository;

    @GetMapping("/posts")
    public ApiResponse<List<Map<String, Object>>> listPosts() {
        Long currentUserId = SecurityUtils.currentUserId();
        List<CommunityPost> posts = communityService.listPosts();
        List<Map<String, Object>> result = posts.stream()
                .map(post -> toPostDto(post, currentUserId))
                .collect(Collectors.toList());
        return ApiResponse.ok(result);
    }

    @GetMapping("/posts/admin")
    public ApiResponse<List<Map<String, Object>>> listAllPosts() {
        List<CommunityPost> posts = communityService.listAllPosts();
        List<Map<String, Object>> result = posts.stream()
                .map(this::toAdminPostDto)
                .collect(Collectors.toList());
        return ApiResponse.ok(result);
    }

    @PostMapping("/posts/{postId}/audit")
    public ApiResponse<Map<String, Object>> auditPost(
            @PathVariable Long postId,
            @RequestBody Map<String, String> body) {
        String auditStatus = body.get("auditStatus");
        String auditMessage = body.get("auditMessage");
        CommunityPost post = communityService.auditPost(postId, auditStatus, auditMessage);
        return ApiResponse.ok("审核状态已更新", toAdminPostDto(post));
    }

    @GetMapping("/posts/{postId}")
    public ApiResponse<Map<String, Object>> getPostDetail(@PathVariable Long postId) {
        Long currentUserId = SecurityUtils.currentUserId();
        CommunityPost post = communityService.getPost(postId);
        List<CommunityPostComment> comments = communityService.listComments(postId);
        Map<String, Object> result = toPostDto(post, currentUserId);
        result.put("comments", comments.stream()
                .map(c -> toCommentDto(c, currentUserId))
                .collect(Collectors.toList()));
        return ApiResponse.ok(result);
    }

    @PostMapping("/posts")
    public ApiResponse<Map<String, Object>> createPost(@Valid @RequestBody CreatePostRequest request) {
        JwtUserPrincipal principal = SecurityUtils.requirePrincipal();
        CommunityPost post = communityService.createPost(request, principal);
        return ApiResponse.ok("帖子已发布", toPostDto(post, principal.getId()));
    }

    @PostMapping("/posts/{postId}/like")
    public ApiResponse<Map<String, Object>> toggleLike(@PathVariable Long postId) {
        Long userId = SecurityUtils.requireUserId();
        boolean liked = communityService.toggleLike(postId, userId);
        Map<String, Object> result = new HashMap<>();
        result.put("liked", liked);
        result.put("likeCount", communityService.getPost(postId).getLikeCount());
        return ApiResponse.ok(liked ? "已点赞" : "已取消点赞", result);
    }

    @PostMapping("/posts/{postId}/favorite")
    public ApiResponse<Map<String, Object>> toggleFavorite(@PathVariable Long postId) {
        Long userId = SecurityUtils.requireUserId();
        boolean favorited = communityService.toggleFavorite(postId, userId);
        Map<String, Object> result = new HashMap<>();
        result.put("favorited", favorited);
        return ApiResponse.ok(favorited ? "已收藏" : "已取消收藏", result);
    }

    @GetMapping("/posts/favorites")
    public ApiResponse<List<Long>> listFavorites() {
        Long currentUserId = SecurityUtils.currentUserId();
        List<Long> postIds = communityService.listFavoritePostIds(currentUserId);
        return ApiResponse.ok(postIds);
    }

    @PutMapping("/posts/{postId}")
    public ApiResponse<Map<String, Object>> updatePost(
            @PathVariable Long postId,
            @Valid @RequestBody CreatePostRequest request) {
        JwtUserPrincipal principal = SecurityUtils.requirePrincipal();
        CommunityPost post = communityService.updatePost(postId, request, principal);
        return ApiResponse.ok("帖子已更新", toPostDto(post, principal.getId()));
    }

    @DeleteMapping("/posts/{postId}")
    public ApiResponse<Void> deletePost(@PathVariable Long postId) {
        JwtUserPrincipal principal = SecurityUtils.requirePrincipal();
        communityService.deletePost(postId, principal);
        return ApiResponse.ok("帖子已删除", null);
    }

    @PostMapping("/posts/{postId}/comments")
    public ApiResponse<Map<String, Object>> createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CreateCommentRequest request) {
        JwtUserPrincipal principal = SecurityUtils.requirePrincipal();
        CommunityPostComment comment = communityService.createComment(postId, request, principal);
        return ApiResponse.ok("评论已发布", toCommentDto(comment, principal.getId()));
    }

    private Map<String, Object> toPostDto(CommunityPost post, Long currentUserId) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", post.getId());
        dto.put("topic", post.getTopic());
        dto.put("title", post.getTitle());
        dto.put("content", post.getContent());
        dto.put("imageUrl", post.getImageUrl());
        dto.put("likes", post.getLikeCount());
        dto.put("commentCount", commentRepository.countByPostId(post.getId()));
        dto.put("author", communityService.getUsernameById(post.getAuthorId()));
        dto.put("authorId", post.getAuthorId());
        dto.put("mine", currentUserId != null && currentUserId.equals(post.getAuthorId()));
        dto.put("liked", currentUserId != null && communityService.hasLiked(post.getId(), currentUserId));
        dto.put("favorited", currentUserId != null && communityService.hasFavorited(post.getId(), currentUserId));
        dto.put("auditStatus", post.getAuditStatus());
        dto.put("auditMessage", post.getAuditMessage());
        dto.put("time", formatTime(post.getCreatedAt()));
        return dto;
    }

    private Map<String, Object> toAdminPostDto(CommunityPost post) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", post.getId());
        dto.put("topic", post.getTopic());
        dto.put("title", post.getTitle());
        dto.put("content", post.getContent());
        dto.put("imageUrl", post.getImageUrl());
        dto.put("likes", post.getLikeCount());
        dto.put("commentCount", commentRepository.countByPostId(post.getId()));
        dto.put("author", communityService.getUsernameById(post.getAuthorId()));
        dto.put("authorId", post.getAuthorId());
        dto.put("auditStatus", post.getAuditStatus());
        dto.put("auditMessage", post.getAuditMessage());
        dto.put("time", formatTime(post.getCreatedAt()));
        return dto;
    }

    private Map<String, Object> toCommentDto(CommunityPostComment comment, Long currentUserId) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", comment.getId());
        dto.put("postId", comment.getPostId());
        dto.put("parentId", comment.getParentCommentId());
        dto.put("author", communityService.getUsernameById(comment.getAuthorId()));
        dto.put("authorId", comment.getAuthorId());
        dto.put("content", comment.getContent());
        dto.put("mine", currentUserId != null && currentUserId.equals(comment.getAuthorId()));
        dto.put("time", formatTime(comment.getCreatedAt()));
        return dto;
    }

    private String formatTime(java.time.LocalDateTime time) {
        if (time == null) return "";
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        if (time.toLocalDate().equals(now.toLocalDate())) return "今天";
        if (time.toLocalDate().equals(now.toLocalDate().minusDays(1))) return "昨天";
        long days = java.time.temporal.ChronoUnit.DAYS.between(time.toLocalDate(), now.toLocalDate());
        if (days < 30) return days + "天前";
        return time.format(java.time.format.DateTimeFormatter.ofPattern("MM-dd"));
    }
}
