package com.kyonggi.disaster.report;

import com.kyonggi.disaster.category.Category;
import com.kyonggi.disaster.member.Member;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "report")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Report {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 500)
    private String content;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private ReportStatus status = ReportStatus.ACTIVE;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime resolvedAt;

    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ReportImage> images = new ArrayList<>();

    @PrePersist
    public void prePersist() { this.createdAt = LocalDateTime.now(); }

    public void resolve() {
        this.status = ReportStatus.RESOLVED;
        this.resolvedAt = LocalDateTime.now();
    }

    public enum ReportStatus { ACTIVE, RESOLVED }
}
