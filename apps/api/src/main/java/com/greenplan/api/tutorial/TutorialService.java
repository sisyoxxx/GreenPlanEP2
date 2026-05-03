package com.greenplan.api.tutorial;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TutorialService {

    private static final String DISPLAY_AREA_HOT = "HOT";
    private static final String DISPLAY_AREA_LIST = "LIST";

    private final TutorialRepository tutorialRepository;

    public TutorialService(TutorialRepository tutorialRepository) {
        this.tutorialRepository = tutorialRepository;
    }

    public TutorialListDto listTutorials() {
        List<TutorialItemDto> hotTutorials = tutorialRepository
                .findByDisplayAreaAndPublishedTrueOrderByDisplayOrderAscIdAsc(DISPLAY_AREA_HOT)
                .stream()
                .map(this::toDto)
                .toList();

        List<TutorialItemDto> tutorials = tutorialRepository
                .findByDisplayAreaAndPublishedTrueOrderByDisplayOrderAscIdAsc(DISPLAY_AREA_LIST)
                .stream()
                .map(this::toDto)
                .toList();

        return new TutorialListDto(hotTutorials, tutorials);
    }

    public TutorialItemDto getTutorialDetail(Long id) {
        Tutorial tutorial = tutorialRepository.findByIdAndPublishedTrue(id)
                .orElseThrow(() -> new IllegalArgumentException("Tutorial not found"));
        return toDto(tutorial);
    }

    public List<TutorialAdminDto> listAllTutorials() {
        return tutorialRepository.findAllByOrderByDisplayAreaAscDisplayOrderAscIdAsc()
                .stream()
                .map(this::toAdminDto)
                .toList();
    }

    @Transactional
    public TutorialAdminDto create(TutorialUpsertRequest request) {
        Tutorial tutorial = new Tutorial();
        applyRequest(tutorial, request);
        return toAdminDto(tutorialRepository.save(tutorial));
    }

    @Transactional
    public TutorialAdminDto update(Long id, TutorialUpsertRequest request) {
        Tutorial tutorial = tutorialRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tutorial not found"));
        applyRequest(tutorial, request);
        return toAdminDto(tutorialRepository.save(tutorial));
    }

    @Transactional
    public void delete(Long id) {
        if (!tutorialRepository.existsById(id)) {
            throw new IllegalArgumentException("Tutorial not found");
        }
        tutorialRepository.deleteById(id);
    }

    @Transactional
    public void swapDisplayOrder(Long id, String direction) {
        Tutorial current = tutorialRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tutorial not found"));

        String area = current.getDisplayArea();
        Integer currentOrder = current.getDisplayOrder();

        Tutorial target = switch (direction.toUpperCase()) {
            case "UP" -> tutorialRepository
                    .findFirstByDisplayAreaAndDisplayOrderLessThanOrderByDisplayOrderDesc(area, currentOrder)
                    .orElse(null);
            case "DOWN" -> tutorialRepository
                    .findFirstByDisplayAreaAndDisplayOrderGreaterThanOrderByDisplayOrderAsc(area, currentOrder)
                    .orElse(null);
            default -> throw new IllegalArgumentException("Direction must be UP or DOWN");
        };

        if (target == null) {
            throw new IllegalArgumentException("无法移动，已在区域最" + (direction.equalsIgnoreCase("UP") ? "顶部" : "底部"));
        }

        Integer targetOrder = target.getDisplayOrder();
        target.setDisplayOrder(currentOrder);
        current.setDisplayOrder(targetOrder);
        tutorialRepository.save(target);
        tutorialRepository.save(current);
    }

    private TutorialItemDto toDto(Tutorial tutorial) {
        return new TutorialItemDto(
                tutorial.getId(),
                tutorial.getDisplayArea(),
                tutorial.getDisplayOrder(),
                tutorial.getTag(),
                tutorial.getCategoryCode(),
                tutorial.getTitle(),
                tutorial.getDescription(),
                tutorial.getDifficulty(),
                tutorial.getDurationMinutes(),
                tutorial.getBackgroundStyle(),
                tutorial.getMediaUrl(),
                tutorial.getMediaType(),
                tutorial.getDetailVideoUrl(),
                tutorial.isFavoriteDefault()
        );
    }

    private TutorialAdminDto toAdminDto(Tutorial tutorial) {
        return new TutorialAdminDto(
                tutorial.getId(),
                tutorial.getDisplayArea(),
                tutorial.getDisplayOrder(),
                tutorial.getTag(),
                tutorial.getCategoryCode(),
                tutorial.getTitle(),
                tutorial.getDescription(),
                tutorial.getDifficulty(),
                tutorial.getDurationMinutes(),
                tutorial.getBackgroundStyle(),
                tutorial.getMediaUrl(),
                tutorial.getMediaType(),
                tutorial.getDetailVideoUrl(),
                tutorial.isFavoriteDefault(),
                tutorial.isPublished(),
                tutorial.getCreatedAt(),
                tutorial.getUpdatedAt()
        );
    }

    private void applyRequest(Tutorial tutorial, TutorialUpsertRequest request) {
        tutorial.setDisplayArea(request.displayArea());
        tutorial.setDisplayOrder(request.displayOrder());
        tutorial.setTag(request.tag());
        tutorial.setCategoryCode(request.categoryCode());
        tutorial.setTitle(request.title());
        tutorial.setDescription(request.description());
        tutorial.setDifficulty(request.difficulty());
        tutorial.setDurationMinutes(request.durationMinutes());
        tutorial.setBackgroundStyle(request.backgroundStyle());
        String mediaUrl = normalizeText(request.mediaUrl());
        tutorial.setMediaUrl(mediaUrl);
        tutorial.setMediaType(mediaUrl == null ? null : normalizeMediaType(request.mediaType()));
        tutorial.setDetailVideoUrl(normalizeText(request.detailVideoUrl()));
        tutorial.setFavoriteDefault(request.favoriteDefault());
        tutorial.setPublished(request.published());
    }

    private String normalizeText(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeMediaType(String value) {
        String normalized = normalizeText(value);
        if (normalized == null) {
            return null;
        }
        String upper = normalized.toUpperCase();
        if (!"IMAGE".equals(upper) && !"VIDEO".equals(upper)) {
            throw new IllegalArgumentException("Unsupported media type");
        }
        return upper;
    }
}
