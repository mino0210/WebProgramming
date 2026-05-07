package com.kyonggi.disaster.websocket;

import com.kyonggi.disaster.report.Report;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * /topic/pins 채널로 브로드캐스트되는 메시지
 * React에서 수신 후 카카오맵에 핀 즉시 추가
 */
@Getter
@AllArgsConstructor
public class PinMessage {

    private final Long   reportId;
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
