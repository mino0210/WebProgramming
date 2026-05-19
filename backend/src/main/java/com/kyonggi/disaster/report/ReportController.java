package com.kyonggi.disaster.report;

import com.kyonggi.disaster.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<ApiResponse<ReportResponse>> create(
            @RequestPart("data") @Valid ReportCreateRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @RequestParam Long memberId) {
        return ResponseEntity.ok(
                ApiResponse.success("제보가 등록되었습니다.", reportService.create(memberId, request, images)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReportResponse>>> getList(
            @RequestParam(required = false) Long categoryId) {
        List<ReportResponse> result = categoryId != null
                ? reportService.getByCategory(categoryId)
                : reportService.getActive();
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<ReportResponse>> resolve(
            @PathVariable Long id, @RequestParam Long memberId) {
        return ResponseEntity.ok(
                ApiResponse.success("해결 완료 처리되었습니다.", reportService.resolve(id, memberId)));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ReportResponse>>> getMy(
            @RequestParam Long memberId) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getMy(memberId)));
    }
}
