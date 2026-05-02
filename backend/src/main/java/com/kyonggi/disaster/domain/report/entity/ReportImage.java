package com.kyonggi.disaster.domain.report.entity;

import jakarta.persistence.*;
import lombok.*;

/** 제보 첨부 이미지 */
@Entity
@Table(name = "report_image")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ReportImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private Report report;

    @Column(nullable = false)
    private String filePath;    // 저장 경로 (예: uploads/images/uuid.jpg)

    @Column(nullable = false)
    private String originalName;
}
