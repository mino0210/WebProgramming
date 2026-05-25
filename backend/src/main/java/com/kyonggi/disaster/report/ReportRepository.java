package com.kyonggi.disaster.report;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {

    List<Report> findAllByOrderByCreatedAtDesc();

    List<Report> findByStatusOrderByCreatedAtDesc(Report.ReportStatus status);

    List<Report> findByCategoryIdAndStatusOrderByCreatedAtDesc(
            Long categoryId, Report.ReportStatus status);

    List<Report> findByMemberIdOrderByCreatedAtDesc(Long memberId);

    @Query("SELECT r.latitude, r.longitude FROM Report r WHERE r.status = 'ACTIVE'")
    List<Object[]> findActiveCoordinates();
}
