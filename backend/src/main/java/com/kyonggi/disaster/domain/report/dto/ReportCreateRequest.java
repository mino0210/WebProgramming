package com.kyonggi.disaster.domain.report.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

/** 제보 등록 요청 DTO */
@Getter
public class ReportCreateRequest {

    @NotBlank(message = "제목을 입력해주세요.")
    private String title;

    @NotBlank(message = "내용을 입력해주세요.")
    private String content;

    @NotNull(message = "카테고리를 선택해주세요.")
    private Long categoryId;

    @NotNull(message = "위치 정보가 필요합니다.")
    private Double latitude;

    @NotNull(message = "위치 정보가 필요합니다.")
    private Double longitude;
}
