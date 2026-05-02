package com.kyonggi.disaster.domain.report.controller;

import com.kyonggi.disaster.common.response.ApiResponse;
import com.kyonggi.disaster.domain.report.dto.ReportCreateRequest;
import com.kyonggi.disaster.domain.report.dto.ReportResponse;
import com.kyonggi.disaster.domain.report.service.ReportService;
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

    /** POST /api/reports  — 제보 등록 (multipart: 사진 첨부) */
    @PostMapping
    public ResponseEntity<ApiResponse<ReportResponse>> createReport(
            @RequestPart("data") @Valid ReportCreateRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @RequestParam Long memberId) {   // TODO: 인증 후 세션에서 추출
        return ResponseEntity.ok(ApiResponse.success("제보가 등록되었습니다.", reportService.createReport(memberId, request, images)));
    }

    /** GET /api/reports  — 활성 제보 전체 */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ReportResponse>>> getActiveReports(
            @RequestParam(required = false) Long categoryId) {
        List<ReportResponse> result = categoryId != null
                ? reportService.getReportsByCategory(categoryId)
                : reportService.getActiveReports();
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /** PATCH /api/reports/{id}/resolve  — 해결 완료 */
    @PatchMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<ReportResponse>> resolveReport(
            @PathVariable Long id,
            @RequestParam Long memberId) {   // TODO: 인증 후 세션에서 추출
        return ResponseEntity.ok(ApiResponse.success("해결 완료 처리되었습니다.", reportService.resolveReport(id, memberId)));
    }

    /** GET /api/reports/my  — 내 제보 이력 */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ReportResponse>>> getMyReports(@RequestParam Long memberId) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getMemberReports(memberId)));
    }
}
