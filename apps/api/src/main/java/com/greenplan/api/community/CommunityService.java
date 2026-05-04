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
    private final UserRepository userRepository;

    public List<CommunityPost> listPosts() {
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
        return postRepository.save(post);
    }

    @Transactional
    public boolean toggleLike(Long postId, JwtUserPrincipal principal) {
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("帖子不存在"));
        boolean alreadyLiked = likeRepository.existsByPostIdAndUserId(postId, principal.getId());
        if (alreadyLiked) {
            likeRepository.deleteByPostIdAndUserId(postId, principal.getId());
            post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
            postRepository.save(post);
            return false;
        } else {
            PostLike like = new PostLike();
            like.setPostId(postId);
            like.setUserId(principal.getId());
            likeRepository.save(like);
            post.setLikeCount(post.getLikeCount() + 1);
            postRepository.save(post);
            return true;
        }
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
