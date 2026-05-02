package com.kyonggi.disaster.websocket.dto;

import com.kyonggi.disaster.domain.report.entity.Report;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 새 핀 등록 시 /topic/pins 채널로 브로드캐스트되는 메시지
 * React에서 이 데이터를 받아 카카오맵에 핀을 즉시 추가함
 */
@Getter
@AllArgsConstructor
public class PinMessage {

    private final Long reportId;
    private final String nickname;
    private final String categoryName;
    private final String categoryColor;
    private final String title;
    private final Double latitude;
    private final Double longitude;
    private final String status;

    public static PinMessage from(Report report) {
        return new PinMessage(
                report.getId(),
                report.getMember().getNickname(),
                report.getCategory().getName(),
                report.getCategory().getColor(),
                report.getTitle(),
                report.getLatitude(),
                report.getLongitude(),
                report.getStatus().name()
        );
    }
}
