package com.kyonggi.disaster.common.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** 오류 응답 포맷 */
@Getter
@AllArgsConstructor
public class ErrorResponse {
    private final int status;
    private final String message;
}
