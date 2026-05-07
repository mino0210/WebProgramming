package com.kyonggi.disaster.sympathy;

import com.kyonggi.disaster.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class SympathyController {

    private final SympathyService sympathyService;

    @PostMapping("/{reportId}/sympathy")
    public ResponseEntity<ApiResponse<SympathyResponse>> toggle(
            @PathVariable Long reportId, @RequestParam Long memberId) {
        return ResponseEntity.ok(ApiResponse.success(sympathyService.toggle(reportId, memberId)));
    }
}
