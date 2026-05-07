package com.kyonggi.disaster.report;

import com.kyonggi.disaster.category.Category;
import com.kyonggi.disaster.category.CategoryRepository;
import com.kyonggi.disaster.common.CustomException;
import com.kyonggi.disaster.member.Member;
import com.kyonggi.disaster.member.MemberRepository;
import com.kyonggi.disaster.sympathy.SympathyRepository;
import com.kyonggi.disaster.websocket.PinMessage;
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

    private final ReportRepository      reportRepository;
    private final MemberRepository      memberRepository;
    private final CategoryRepository    categoryRepository;
    private final SympathyRepository    sympathyRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Transactional
    public ReportResponse create(Long memberId, ReportCreateRequest req, List<MultipartFile> images) {
        Member   member   = memberRepository.findById(memberId)
                .orElseThrow(() -> CustomException.notFound("회원을 찾을 수 없습니다."));
        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> CustomException.notFound("카테고리를 찾을 수 없습니다."));

        Report report = Report.builder()
                .member(member).category(category)
                .title(req.getTitle()).content(req.getContent())
                .latitude(req.getLatitude()).longitude(req.getLongitude())
                .build();

        if (images != null) {
            for (MultipartFile file : images) {
                String path = saveImage(file);
                report.getImages().add(ReportImage.builder()
                        .report(report).filePath(path)
                        .originalName(file.getOriginalFilename()).build());
            }
        }

        Report saved = reportRepository.save(report);

        // ★ 새 핀 전체 브로드캐스트
        messagingTemplate.convertAndSend("/topic/pins", PinMessage.from(saved));

        return new ReportResponse(saved, 0);
    }

    public List<ReportResponse> getActive() {
        return reportRepository.findByStatusOrderByCreatedAtDesc(Report.ReportStatus.ACTIVE)
                .stream()
                .map(r -> new ReportResponse(r, sympathyRepository.countByReportId(r.getId())))
                .collect(Collectors.toList());
    }

    public List<ReportResponse> getByCategory(Long categoryId) {
        return reportRepository.findByCategoryIdAndStatusOrderByCreatedAtDesc(
                        categoryId, Report.ReportStatus.ACTIVE)
                .stream()
                .map(r -> new ReportResponse(r, sympathyRepository.countByReportId(r.getId())))
                .collect(Collectors.toList());
    }

    @Transactional
    public ReportResponse resolve(Long reportId, Long memberId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> CustomException.notFound("제보를 찾을 수 없습니다."));
        if (!report.getMember().getId().equals(memberId))
            throw CustomException.badRequest("본인의 제보만 완료 처리할 수 있습니다.");

        report.resolve();
        return new ReportResponse(report, sympathyRepository.countByReportId(reportId));
    }

    public List<ReportResponse> getMy(Long memberId) {
        return reportRepository.findByMemberIdOrderByCreatedAtDesc(memberId)
                .stream()
                .map(r -> new ReportResponse(r, sympathyRepository.countByReportId(r.getId())))
                .collect(Collectors.toList());
    }

    private String saveImage(MultipartFile file) {
        String ext  = getExt(file.getOriginalFilename());
        String name = UUID.randomUUID() + ext;
        File   dir  = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();
        try { file.transferTo(new File(uploadDir + name)); }
        catch (IOException e) { throw new RuntimeException("이미지 저장 실패", e); }
        return name;
    }

    private String getExt(String filename) {
        if (filename == null || !filename.contains(".")) return ".jpg";
        return filename.substring(filename.lastIndexOf("."));
    }
}
