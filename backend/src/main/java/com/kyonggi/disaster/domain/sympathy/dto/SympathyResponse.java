package com.kyonggi.disaster.domain.sympathy.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** 공감 응답 DTO — WebSocket으로 브로드캐스트됨 */
@Getter
@AllArgsConstructor
public class SympathyResponse {
    private final Long reportId;
    private final int count;
    private final boolean alertTriggered;   // 임계치(4개) 초과 여부
}
