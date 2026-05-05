package com.greenplan.api.community;

import com.greenplan.api.auth.UserRepository;
import com.greenplan.api.security.JwtUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final CommunityPostRepository postRepository;
    private final CommunityPostCommentRepository commentRepository;
    private final PostLikeRepository likeRepository;
    private final PostFavoriteRepository favoriteRepository;
    private final UserRepository userRepository;

    public List<CommunityPost> listPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(post -> !"rejected".equals(post.getAuditStatus()) && !"hidden".equals(post.getAuditStatus()))
                .toList();
    }

    public List<CommunityPost> listAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }

    public CommunityPost getPost(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("帖子不存在"));
    }

    public List<CommunityPostComment> listComments(Long postId) {
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId);
    }

    @Transactional
    public CommunityPost createPost(CreatePostRequest request, JwtUserPrincipal principal) {
        CommunityPost post = new CommunityPost();
        post.setAuthorId(principal.getId());
        post.setTopic(request.topic());
        post.setTitle(request.title());
        post.setContent(request.content());
        post.setImageUrl(request.imageUrl());
        post.setLikeCount(0);
        post.setAuditStatus("approved");
        return postRepository.save(post);
    }

    @Transactional
    public CommunityPost auditPost(Long postId, String auditStatus, String auditMessage) {
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("帖子不存在"));
        if ("approved".equals(auditStatus) || "rejected".equals(auditStatus) || "hidden".equals(auditStatus)) {
            post.setAuditStatus(auditStatus);
        }
        if ("approved".equals(auditStatus)) {
            post.setAuditMessage(null);
        } else {
            post.setAuditMessage(auditMessage);
        }
        return postRepository.save(post);
    }

    @Transactional
    public CommunityPost updatePost(Long postId, CreatePostRequest request, JwtUserPrincipal principal) {
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("帖子不存在"));
        if (!principal.getId().equals(post.getAuthorId())) {
            throw new IllegalArgumentException("无权编辑他人帖子");
        }
        post.setTopic(request.topic());
        post.setTitle(request.title());
        post.setContent(request.content());
        post.setImageUrl(request.imageUrl());
        return postRepository.save(post);
    }

    @Transactional
    public void deletePost(Long postId, JwtUserPrincipal principal) {
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("帖子不存在"));
        if (!principal.getId().equals(post.getAuthorId())) {
            throw new IllegalArgumentException("无权删除他人帖子");
        }
        commentRepository.deleteByPostId(postId);
        likeRepository.deleteByPostId(postId);
        favoriteRepository.deleteByPostId(postId);
        postRepository.delete(post);
    }

    @Transactional
    public boolean toggleLike(Long postId, JwtUserPrincipal principal) {
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("帖子不存在"));
        boolean alreadyLiked = likeRepository.existsByPostIdAndUserId(postId, principal.getId());
        int currentLikeCount = post.getLikeCount() == null ? 0 : post.getLikeCount();
        if (alreadyLiked) {
            likeRepository.deleteByPostIdAndUserId(postId, principal.getId());
            post.setLikeCount(Math.max(0, currentLikeCount - 1));
            postRepository.save(post);
            return false;
        } else {
            PostLike like = new PostLike();
            like.setPostId(postId);
            like.setUserId(principal.getId());
            likeRepository.save(like);
            post.setLikeCount(currentLikeCount + 1);
            postRepository.save(post);
            return true;
        }
    }

    @Transactional
    public boolean toggleFavorite(Long postId, JwtUserPrincipal principal) {
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("帖子不存在"));
        boolean alreadyFavorited = favoriteRepository.existsByPostIdAndUserId(postId, principal.getId());
        if (alreadyFavorited) {
            favoriteRepository.deleteByPostIdAndUserId(postId, principal.getId());
            return false;
        } else {
            PostFavorite favorite = new PostFavorite();
            favorite.setPostId(postId);
            favorite.setUserId(principal.getId());
            favoriteRepository.save(favorite);
            return true;
        }
    }

    public boolean hasFavorited(Long postId, Long userId) {
        if (userId == null) return false;
        return favoriteRepository.existsByPostIdAndUserId(postId, userId);
    }

    public List<Long> listFavoritePostIds(Long userId) {
        if (userId == null) return List.of();
        return favoriteRepository.findByUserId(userId).stream()
                .map(PostFavorite::getPostId)
                .toList();
    }

    public boolean hasLiked(Long postId, Long userId) {
        if (userId == null) return false;
        return likeRepository.existsByPostIdAndUserId(postId, userId);
    }


    @Transactional
    public CommunityPostComment createComment(Long postId, CreateCommentRequest request, JwtUserPrincipal principal) {
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("帖子不存在"));
        CommunityPostComment comment = new CommunityPostComment();
        comment.setPostId(postId);
        comment.setAuthorId(principal.getId());
        comment.setContent(request.content());
        comment.setParentCommentId(request.parentCommentId());
        return commentRepository.save(comment);
    }

    public String getUsernameById(Long userId) {
        return userRepository.findById(userId)
                .map(u -> u.getUsername())
                .orElse("匿名用户");
    }
}
