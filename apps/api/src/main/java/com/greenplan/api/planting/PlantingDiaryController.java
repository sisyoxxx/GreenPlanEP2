package com.greenplan.api.planting;

import com.greenplan.api.common.ApiResponse;
import com.greenplan.api.security.JwtUserPrincipal;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class PlantingDiaryController {

    private final PlantingDiaryService plantingDiaryService;
    private final Path uploadDir;

    public PlantingDiaryController(PlantingDiaryService plantingDiaryService) {
        this.plantingDiaryService = plantingDiaryService;
        this.uploadDir = Paths.get("D:/tool/aLemon/vue/GreenPlanEP2/uploads");
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("无法创建上传目录", e);
        }
    }

    @GetMapping("/planting-diaries")
    public ApiResponse<List<PlantingDiaryDto>> listDiaries(Authentication authentication) {
        Long userId = extractUserId(authentication);
        if (userId == null) {
            return ApiResponse.ok(List.of());
        }
        return ApiResponse.ok(plantingDiaryService.listByUserId(userId));
    }

    @PostMapping("/planting-diaries")
    public ApiResponse<PlantingDiaryDto> create(@Valid @RequestBody CreatePlantingDiaryRequest request, Authentication authentication) {
        Long userId = extractUserId(authentication);
        if (userId == null) {
            throw new IllegalArgumentException("请先登录");
        }
        return ApiResponse.ok("Diary created", plantingDiaryService.create(request, userId));
    }

    @PutMapping("/planting-diaries/{id}")
    public ApiResponse<PlantingDiaryDto> update(@PathVariable Long id, @Valid @RequestBody CreatePlantingDiaryRequest request, Authentication authentication) {
        Long userId = extractUserId(authentication);
        if (userId == null) {
            throw new IllegalArgumentException("请先登录");
        }
        return ApiResponse.ok("Diary updated", plantingDiaryService.update(id, request, userId));
    }

    @DeleteMapping("/planting-diaries/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id, Authentication authentication) {
        Long userId = extractUserId(authentication);
        if (userId == null) {
            throw new IllegalArgumentException("请先登录");
        }
        plantingDiaryService.delete(id, userId);
        return ApiResponse.ok("Diary deleted");
    }

    @PostMapping("/planting-diaries/upload")
    public ApiResponse<String> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("文件为空");
        }
        String original = file.getOriginalFilename();
        String ext = original != null && original.contains(".") ? original.substring(original.lastIndexOf(".")) : "";
        String filename = UUID.randomUUID() + ext;
        try {
            Path target = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return ApiResponse.ok("上传成功", "/api/planting-diaries/images/" + filename);
        } catch (IOException e) {
            throw new RuntimeException("上传失败", e);
        }
    }

    @GetMapping("/planting-diaries/images/{filename}")
    public ResponseEntity<Resource> serveImage(@PathVariable String filename) {
        try {
            Path filePath = uploadDir.resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }

    private Long extractUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) return null;
        Object principal = authentication.getPrincipal();
        if (principal instanceof JwtUserPrincipal) {
            return ((JwtUserPrincipal) principal).getId();
        }
        return null;
    }
}
