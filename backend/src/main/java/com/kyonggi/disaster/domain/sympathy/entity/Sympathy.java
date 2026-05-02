package com.kyonggi.disaster.domain.sympathy.entity;

import com.kyonggi.disaster.domain.member.entity.Member;
import com.kyonggi.disaster.domain.report.entity.Report;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** 공감(위험해요) 테이블 — 1인 1회 제한 */
@Entity
@Table(name = "sympathy",
       uniqueConstraints = @UniqueConstraint(columnNames = {"report_id", "member_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Sympathy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private Report report;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
