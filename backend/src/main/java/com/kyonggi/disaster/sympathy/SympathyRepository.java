package com.kyonggi.disaster.sympathy;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SympathyRepository extends JpaRepository<Sympathy, Long> {
    int     countByReportId(Long reportId);
    boolean existsByReportIdAndMemberId(Long reportId, Long memberId);
    void    deleteByReportIdAndMemberId(Long reportId, Long memberId);
}
