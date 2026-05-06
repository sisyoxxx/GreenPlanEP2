package com.greenplan.api.planting;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PlantingDiaryService {

    private final PlantingDiaryRepository plantingDiaryRepository;

    public PlantingDiaryService(PlantingDiaryRepository plantingDiaryRepository) {
        this.plantingDiaryRepository = plantingDiaryRepository;
    }

    public List<PlantingDiaryDto> listByUserId(Long userId) {
        return plantingDiaryRepository.findByUserIdOrderByDiaryDateDescIdDesc(userId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public PlantingDiaryDto create(CreatePlantingDiaryRequest request, Long userId) {
        PlantingDiary diary = new PlantingDiary();
        diary.setUserId(userId);
        diary.setTitle(request.title());
        diary.setPlantName(request.plantName());
        diary.setCategory(request.category());
        diary.setDiaryDate(request.diaryDate());
        diary.setNote(request.note());
        diary.setImageName(request.imageName());
        return toDto(plantingDiaryRepository.save(diary));
    }

    @Transactional
    public PlantingDiaryDto update(Long id, CreatePlantingDiaryRequest request, Long userId) {
        PlantingDiary diary = plantingDiaryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Diary not found"));
        if (!userId.equals(diary.getUserId())) {
            throw new IllegalArgumentException("无权编辑他人日记");
        }
        diary.setTitle(request.title());
        diary.setPlantName(request.plantName());
        diary.setCategory(request.category());
        diary.setDiaryDate(request.diaryDate());
        diary.setNote(request.note());
        diary.setImageName(request.imageName());
        return toDto(plantingDiaryRepository.save(diary));
    }

    @Transactional
    public void delete(Long id, Long userId) {
        PlantingDiary diary = plantingDiaryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Diary not found"));
        if (!userId.equals(diary.getUserId())) {
            throw new IllegalArgumentException("无权删除他人日记");
        }
        plantingDiaryRepository.delete(diary);
    }

    private PlantingDiaryDto toDto(PlantingDiary diary) {
        return new PlantingDiaryDto(
                diary.getId(),
                diary.getUserId(),
                diary.getTitle(),
                diary.getPlantName(),
                diary.getCategory(),
                diary.getDiaryDate(),
                diary.getNote(),
                diary.getImageName(),
                diary.getCreatedAt(),
                diary.getUpdatedAt()
        );
    }
}
