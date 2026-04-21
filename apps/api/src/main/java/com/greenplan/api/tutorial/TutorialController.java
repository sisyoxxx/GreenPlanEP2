package com.greenplan.api.tutorial;

import com.greenplan.api.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TutorialController {

    private final TutorialService tutorialService;

    public TutorialController(TutorialService tutorialService) {
        this.tutorialService = tutorialService;
    }

    @GetMapping("/tutorials")
    public ApiResponse<TutorialListDto> listTutorials() {
        return ApiResponse.ok(tutorialService.listTutorials());
    }

    @GetMapping("/tutorials/{id}")
    public ApiResponse<TutorialItemDto> getTutorialDetail(@PathVariable Long id) {
        return ApiResponse.ok(tutorialService.getTutorialDetail(id));
    }

    @GetMapping("/admin/tutorials")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<TutorialAdminDto>> listAdminTutorials() {
        return ApiResponse.ok(tutorialService.listAllTutorials());
    }

    @PostMapping("/admin/tutorials")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<TutorialAdminDto> create(@Valid @RequestBody TutorialUpsertRequest request) {
        return ApiResponse.ok("Tutorial published", tutorialService.create(request));
    }

    @PutMapping("/admin/tutorials/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<TutorialAdminDto> update(@PathVariable Long id, @Valid @RequestBody TutorialUpsertRequest request) {
        return ApiResponse.ok("Tutorial updated", tutorialService.update(id, request));
    }

    @DeleteMapping("/admin/tutorials/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        tutorialService.delete(id);
        return ApiResponse.ok("Tutorial deleted");
    }
}
