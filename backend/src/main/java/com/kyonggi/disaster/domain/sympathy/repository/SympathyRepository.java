package com.kyonggi.disaster.domain.sympathy.repository;

import com.kyonggi.disaster.domain.sympathy.entity.Sympathy;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SympathyRepository extends JpaRepository<Sympathy, Long> {
    int countByReportId(Long reportId);
    boolean existsByReportIdAndMemberId(Long reportId, Long memberId);
    void deleteByReportIdAndMemberId(Long reportId, Long memberId);
}
