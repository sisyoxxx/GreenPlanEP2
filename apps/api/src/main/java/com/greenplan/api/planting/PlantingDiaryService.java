package com.greenplan.api.planting;

import com.greenplan.api.common.exception.PermissionDeniedException;
import com.greenplan.api.common.exception.ResourceNotFoundException;
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
        PlantingDiary diary = mapToEntity(request, userId);
        return toDto(plantingDiaryRepository.save(diary));
    }

    @Transactional
    public PlantingDiaryDto update(Long id, CreatePlantingDiaryRequest request, Long userId) {
        PlantingDiary diary = findOwnedDiary(id, userId);
        applyRequestToEntity(diary, request);
        return toDto(plantingDiaryRepository.save(diary));
    }

    @Transactional
    public void delete(Long id, Long userId) {
        PlantingDiary diary = findOwnedDiary(id, userId);
        plantingDiaryRepository.delete(diary);
    }

    private PlantingDiary findOwnedDiary(Long id, Long userId) {
        PlantingDiary diary = plantingDiaryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("日记不存在"));
        if (!userId.equals(diary.getUserId())) {
            throw new PermissionDeniedException("无权操作他人日记");
        }
        return diary;
    }

    private PlantingDiary mapToEntity(CreatePlantingDiaryRequest request, Long userId) {
        PlantingDiary diary = new PlantingDiary();
        diary.setUserId(userId);
        applyRequestToEntity(diary, request);
        return diary;
    }

    private void applyRequestToEntity(PlantingDiary diary, CreatePlantingDiaryRequest request) {
        diary.setTitle(request.title());
        diary.setPlantName(request.plantName());
        diary.setCategory(request.category());
        diary.setDiaryDate(request.diaryDate());
        diary.setNote(request.note());
        diary.setImageName(request.imageName());
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
