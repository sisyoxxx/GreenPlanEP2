package com.greenplan.api.tutorial;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "tutorials")
public class Tutorial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "display_area", nullable = false, length = 16)
    private String displayArea;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(nullable = false, length = 32)
    private String tag;

    @Column(name = "category_code", length = 32)
    private String categoryCode;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(length = 32)
    private String difficulty;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "background_style", length = 255)
    private String backgroundStyle;

    @Column(name = "media_url", columnDefinition = "MEDIUMTEXT")
    private String mediaUrl;

    @Column(name = "media_type", length = 16)
    private String mediaType;

    @Column(name = "favorite_default", nullable = false)
    private boolean favoriteDefault;

    @Column(nullable = false)
    private boolean published;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
