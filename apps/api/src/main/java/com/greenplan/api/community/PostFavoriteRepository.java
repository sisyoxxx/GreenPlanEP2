package com.greenplan.api.community;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostFavoriteRepository extends JpaRepository<PostFavorite, Long> {
    boolean existsByPostIdAndUserId(Long postId, Long userId);

    void deleteByPostIdAndUserId(Long postId, Long userId);

    List<PostFavorite> findByUserId(Long userId);
}
