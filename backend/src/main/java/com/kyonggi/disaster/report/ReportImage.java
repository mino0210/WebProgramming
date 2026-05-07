package com.kyonggi.disaster.report;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "report_image")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ReportImage {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private Report report;

    @Column(nullable = false)
    private String filePath;

    @Column(nullable = false)
    private String originalName;
}
