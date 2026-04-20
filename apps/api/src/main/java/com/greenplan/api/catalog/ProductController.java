package com.greenplan.api.catalog;

import com.greenplan.api.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/products")
    public ApiResponse<List<ProductDto>> listPublished() {
        return ApiResponse.ok(productService.listPublished());
    }

    @GetMapping("/products/{id}")
    public ApiResponse<ProductDto> detail(@PathVariable Long id) {
        return ApiResponse.ok(productService.getById(id));
    }

    @GetMapping("/admin/products")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<ProductDto>> listAll() {
        return ApiResponse.ok(productService.listAll());
    }

    @PostMapping("/admin/products")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ProductDto> create(@Valid @RequestBody ProductUpsertRequest request) {
        return ApiResponse.ok("Product created", productService.create(request));
    }

    @PutMapping("/admin/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ProductDto> update(@PathVariable Long id, @Valid @RequestBody ProductUpsertRequest request) {
        return ApiResponse.ok("Product updated", productService.update(id, request));
    }

    @PatchMapping("/admin/products/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        productService.updateStatus(id, body.getOrDefault("status", "PUBLISHED"));
        return ApiResponse.ok("Product status updated");
    }
}
