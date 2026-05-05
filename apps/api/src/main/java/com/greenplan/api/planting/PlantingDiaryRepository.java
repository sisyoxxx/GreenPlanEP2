package com.greenplan.api.planting;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlantingDiaryRepository extends JpaRepository<PlantingDiary, Long> {
    List<PlantingDiary> findAllByOrderByDiaryDateDescIdDesc();
}
