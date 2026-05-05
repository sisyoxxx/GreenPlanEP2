package com.greenplan.api.planting;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "planting_diaries")
public class PlantingDiary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "plant_name", nullable = false, length = 128)
    private String plantName;

    @Column(nullable = false, length = 32)
    private String category;

    @Column(name = "diary_date", nullable = false)
    private LocalDate diaryDate;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "image_name", length = 255)
    private String imageName;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
