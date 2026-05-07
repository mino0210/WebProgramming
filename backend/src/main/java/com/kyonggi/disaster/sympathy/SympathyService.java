package com.kyonggi.disaster.sympathy;

import com.kyonggi.disaster.common.CustomException;
import com.kyonggi.disaster.member.Member;
import com.kyonggi.disaster.member.MemberRepository;
import com.kyonggi.disaster.report.Report;
import com.kyonggi.disaster.report.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SympathyService {

    private final SympathyRepository    sympathyRepository;
    private final ReportRepository      reportRepository;
    private final MemberRepository      memberRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${sympathy.alert-threshold}")
    private int alertThreshold;

    @Transactional
    public SympathyResponse toggle(Long reportId, Long memberId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> CustomException.notFound("제보를 찾을 수 없습니다."));
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> CustomException.notFound("회원을 찾을 수 없습니다."));

        if (sympathyRepository.existsByReportIdAndMemberId(reportId, memberId)) {
            sympathyRepository.deleteByReportIdAndMemberId(reportId, memberId);
        } else {
            sympathyRepository.save(
                    Sympathy.builder().report(report).member(member).build());
        }

        int     count          = sympathyRepository.countByReportId(reportId);
        boolean alertTriggered = count >= alertThreshold;
        SympathyResponse response = new SympathyResponse(reportId, count, alertTriggered);

        // ★ 공감 수 실시간 브로드캐스트
        messagingTemplate.convertAndSend("/topic/sympathy", response);

        // ★ 임계치 초과 시 경보
        if (alertTriggered) {
            messagingTemplate.convertAndSend("/topic/alert", response);
        }

        return response;
    }
}
