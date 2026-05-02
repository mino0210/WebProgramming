package com.kyonggi.disaster.domain.report.service;

import com.kyonggi.disaster.common.exception.CustomException;
import com.kyonggi.disaster.domain.category.entity.Category;
import com.kyonggi.disaster.domain.category.repository.CategoryRepository;
import com.kyonggi.disaster.domain.member.entity.Member;
import com.kyonggi.disaster.domain.member.repository.MemberRepository;
import com.kyonggi.disaster.domain.report.dto.ReportCreateRequest;
import com.kyonggi.disaster.domain.report.dto.ReportResponse;
import com.kyonggi.disaster.domain.report.entity.Report;
import com.kyonggi.disaster.domain.report.entity.ReportImage;
import com.kyonggi.disaster.domain.report.repository.ReportRepository;
import com.kyonggi.disaster.domain.sympathy.repository.SympathyRepository;
import com.kyonggi.disaster.websocket.dto.PinMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final ReportRepository reportRepository;
    private final MemberRepository memberRepository;
    private final CategoryRepository categoryRepository;
    private final SympathyRepository sympathyRepository;
    private final SimpMessagingTemplate messagingTemplate;  // WebSocket 브로드캐스트

    @Value("${file.upload-dir}")
    private String uploadDir;

    /** 제보 등록 + WebSocket 브로드캐스트 */
    @Transactional
    public ReportResponse createReport(Long memberId, ReportCreateRequest request, List<MultipartFile> images) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> CustomException.notFound("회원을 찾을 수 없습니다."));
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> CustomException.notFound("카테고리를 찾을 수 없습니다."));

        Report report = Report.builder()
                .member(member)
                .category(category)
                .title(request.getTitle())
                .content(request.getContent())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .build();

        // 이미지 저장
        if (images != null && !images.isEmpty()) {
            for (MultipartFile file : images) {
                String savedPath = saveImage(file);
                report.getImages().add(ReportImage.builder()
                        .report(report)
                        .filePath(savedPath)
                        .originalName(file.getOriginalFilename())
                        .build());
            }
        }

        Report saved = reportRepository.save(report);
        ReportResponse response = new ReportResponse(saved, 0);

        // ★ 핵심: 새 핀 전체 브로드캐스트
        messagingTemplate.convertAndSend("/topic/pins", PinMessage.from(saved));

        return response;
    }

    /** 활성 제보 전체 조회 */
    public List<ReportResponse> getActiveReports() {
        return reportRepository.findByStatusOrderByCreatedAtDesc(Report.ReportStatus.ACTIVE)
                .stream()
                .map(r -> new ReportResponse(r, sympathyRepository.countByReportId(r.getId())))
                .collect(Collectors.toList());
    }

    /** 카테고리 필터 조회 */
    public List<ReportResponse> getReportsByCategory(Long categoryId) {
        return reportRepository.findByCategoryIdAndStatusOrderByCreatedAtDesc(categoryId, Report.ReportStatus.ACTIVE)
                .stream()
                .map(r -> new ReportResponse(r, sympathyRepository.countByReportId(r.getId())))
                .collect(Collectors.toList());
    }

    /** 해결 완료 처리 */
    @Transactional
    public ReportResponse resolveReport(Long reportId, Long memberId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> CustomException.notFound("제보를 찾을 수 없습니다."));

        if (!report.getMember().getId().equals(memberId)) {
            throw CustomException.badRequest("본인의 제보만 완료 처리할 수 있습니다.");
        }

        report.resolve();
        return new ReportResponse(report, sympathyRepository.countByReportId(reportId));
    }

    /** 회원 제보 이력 */
    public List<ReportResponse> getMemberReports(Long memberId) {
        return reportRepository.findByMemberIdOrderByCreatedAtDesc(memberId)
                .stream()
                .map(r -> new ReportResponse(r, sympathyRepository.countByReportId(r.getId())))
                .collect(Collectors.toList());
    }

    private String saveImage(MultipartFile file) {
        String uuid = UUID.randomUUID().toString();
        String ext = getExtension(file.getOriginalFilename());
        String fileName = uuid + ext;

        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        try {
            file.transferTo(new File(uploadDir + fileName));
        } catch (IOException e) {
            throw new RuntimeException("이미지 저장 실패", e);
        }

        return fileName;
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return ".jpg";
        return filename.substring(filename.lastIndexOf("."));
    }
}
