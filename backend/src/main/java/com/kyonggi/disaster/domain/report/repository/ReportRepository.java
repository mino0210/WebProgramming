package com.kyonggi.disaster.domain.report.repository;

import com.kyonggi.disaster.domain.report.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {

    /** 활성 제보 전체 조회 (지도 핀 목록) */
    List<Report> findByStatusOrderByCreatedAtDesc(Report.ReportStatus status);

    /** 카테고리별 활성 제보 조회 */
    List<Report> findByCategoryIdAndStatusOrderByCreatedAtDesc(Long categoryId, Report.ReportStatus status);

    /** 특정 회원의 제보 이력 */
    List<Report> findByMemberIdOrderByCreatedAtDesc(Long memberId);

    /** 히트맵용 위/경도 조회 */
    @Query("SELECT r.latitude, r.longitude FROM Report r WHERE r.status = 'ACTIVE'")
    List<Object[]> findActiveCoordinates();
}
