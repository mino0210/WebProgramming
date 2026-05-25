package com.kyonggi.disaster.report;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kyonggi.disaster.common.ApiResponse;
import com.kyonggi.disaster.common.CustomException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Validated
public class ReportController {

    private final ReportService reportService;
    private final ObjectMapper objectMapper;

    /**
     * 제보 등록.
     *
     * data 파트는 JSON Blob이 아니라 일반 문자열(JSON text)로 받아 직접 파싱합니다.
     * 이렇게 하면 이미지가 포함된 multipart/form-data 요청에서 브라우저/axios boundary나
     * part Content-Type 차이 때문에 @RequestPart DTO 바인딩이 깨지는 문제를 줄일 수 있습니다.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ReportResponse>> create(
            @RequestPart("data") String data,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @RequestParam Long memberId) {

        ReportCreateRequest request = parseCreateRequest(data);
        List<MultipartFile> safeImages = sanitizeImages(images);

        return ResponseEntity.ok(
                ApiResponse.success("제보가 등록되었습니다.", reportService.create(memberId, request, safeImages)));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<ReportResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getAll()));
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

    private ReportCreateRequest parseCreateRequest(String data) {
        try {
            ReportCreateRequest request = objectMapper.readValue(data, ReportCreateRequest.class);
            validateRequest(request);
            return request;
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            throw CustomException.badRequest("제보 데이터 형식이 올바르지 않습니다.");
        }
    }

    private void validateRequest(ReportCreateRequest request) {
        if (request == null) throw CustomException.badRequest("제보 데이터가 비어 있습니다.");
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw CustomException.badRequest("제목을 입력해주세요.");
        }
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw CustomException.badRequest("내용을 입력해주세요.");
        }
        if (request.getCategoryId() == null) throw CustomException.badRequest("카테고리를 선택해주세요.");
        if (request.getLatitude() == null || request.getLongitude() == null) {
            throw CustomException.badRequest("위치 정보가 필요합니다.");
        }
    }

    private List<MultipartFile> sanitizeImages(List<MultipartFile> images) {
        List<MultipartFile> result = new ArrayList<>();
        if (images == null) return result;

        for (MultipartFile image : images) {
            if (image == null || image.isEmpty()) continue;
            result.add(image);
        }
        return result;
    }
}
