package com.kyonggi.disaster.report;

import lombok.Getter;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class ReportResponse {

    private final Long              id;
    private final String            nickname;
    private final String            categoryName;
    private final String            categoryColor;
    private final String            title;
    private final String            content;
    private final Double            latitude;
    private final Double            longitude;
    private final String            status;
    private final int               sympathyCount;
    private final List<String>      imageUrls;
    private final LocalDateTime     createdAt;

    public ReportResponse(Report report, int sympathyCount) {
        this.id            = report.getId();
        this.nickname      = report.getMember().getNickname();
        this.categoryName  = report.getCategory().getName();
        this.categoryColor = report.getCategory().getColor();
        this.title         = report.getTitle();
        this.content       = report.getContent();
        this.latitude      = report.getLatitude();
        this.longitude     = report.getLongitude();
        this.status        = report.getStatus().name();
        this.sympathyCount = sympathyCount;
        this.imageUrls     = report.getImages().stream()
                .map(img -> "/images/" + img.getFilePath())
                .collect(Collectors.toList());
        this.createdAt     = report.getCreatedAt();
    }
}
