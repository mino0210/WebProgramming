package com.kyonggi.disaster.domain.sympathy.controller;

import com.kyonggi.disaster.common.response.ApiResponse;
import com.kyonggi.disaster.domain.sympathy.dto.SympathyResponse;
import com.kyonggi.disaster.domain.sympathy.service.SympathyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class SympathyController {

    private final SympathyService sympathyService;

    /** POST /api/reports/{reportId}/sympathy  — 공감 토글 */
    @PostMapping("/{reportId}/sympathy")
    public ResponseEntity<ApiResponse<SympathyResponse>> toggleSympathy(
            @PathVariable Long reportId,
            @RequestParam Long memberId) {  // TODO: 인증 후 세션에서 추출
        return ResponseEntity.ok(ApiResponse.success(sympathyService.toggleSympathy(reportId, memberId)));
    }
}
