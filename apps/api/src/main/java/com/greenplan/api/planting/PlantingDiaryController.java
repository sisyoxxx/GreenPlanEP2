package com.greenplan.api.planting;

import com.greenplan.api.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class PlantingDiaryController {

    private final PlantingDiaryService plantingDiaryService;

    public PlantingDiaryController(PlantingDiaryService plantingDiaryService) {
        this.plantingDiaryService = plantingDiaryService;
    }

    @GetMapping("/planting-diaries")
    public ApiResponse<List<PlantingDiaryDto>> listDiaries() {
        return ApiResponse.ok(plantingDiaryService.listAllDiaries());
    }

    @PostMapping("/planting-diaries")
    public ApiResponse<PlantingDiaryDto> create(@Valid @RequestBody CreatePlantingDiaryRequest request) {
        return ApiResponse.ok("Diary created", plantingDiaryService.create(request));
    }

    @PutMapping("/planting-diaries/{id}")
    public ApiResponse<PlantingDiaryDto> update(@PathVariable Long id, @Valid @RequestBody CreatePlantingDiaryRequest request) {
        return ApiResponse.ok("Diary updated", plantingDiaryService.update(id, request));
    }

    @DeleteMapping("/planting-diaries/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        plantingDiaryService.delete(id);
        return ApiResponse.ok("Diary deleted");
    }
}
