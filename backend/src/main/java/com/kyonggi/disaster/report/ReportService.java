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

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
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
                if (file == null || file.isEmpty()) continue;
                String path = saveImage(file);
                report.getImages().add(ReportImage.builder()
                        .report(report).filePath(path)
                        .originalName(safeOriginalName(file.getOriginalFilename())).build());
            }
        }

        Report saved = reportRepository.save(report);

        // ★ 새 핀 전체 브로드캐스트
        messagingTemplate.convertAndSend("/topic/pins", PinMessage.from(saved));

        return new ReportResponse(saved, 0);
    }

    public List<ReportResponse> getAll() {
        return reportRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(r -> new ReportResponse(r, sympathyRepository.countByReportId(r.getId())))
                .collect(Collectors.toList());
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

    private String safeOriginalName(String originalName) {
        if (originalName == null || originalName.trim().isEmpty()) return "report-image";
        String normalized = Paths.get(originalName).getFileName().toString();
        return normalized.length() > 240 ? normalized.substring(normalized.length() - 240) : normalized;
    }

    private String saveImage(MultipartFile file) {
        validateImage(file);

        String ext  = getExt(file.getOriginalFilename(), file.getContentType());
        String name = UUID.randomUUID() + ext;

        try {
            Path dirPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(dirPath);

            Path filePath = dirPath.resolve(name).normalize();
            if (!filePath.startsWith(dirPath)) {
                throw CustomException.badRequest("잘못된 파일 경로입니다.");
            }

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        }
        catch (IOException e) {
            throw new RuntimeException("이미지 저장 실패", e);
        }
        return name;
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) return;

        String contentType = file.getContentType();
        if (contentType != null && !contentType.toLowerCase().startsWith("image/")) {
            throw CustomException.badRequest("이미지 파일만 업로드할 수 있습니다.");
        }
    }

    private String getExt(String filename, String contentType) {
        if (filename != null && filename.contains(".")) {
            String ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
            if (ext.matches("\\.(jpg|jpeg|png|gif|webp)")) return ext;
        }
        if (contentType == null) return ".jpg";
        String lower = contentType.toLowerCase();
        if (lower.contains("png")) return ".png";
        if (lower.contains("gif")) return ".gif";
        if (lower.contains("webp")) return ".webp";
        return ".jpg";
    }
}
