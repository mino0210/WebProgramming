package com.kyonggi.disaster.common.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 공통 API 응답 포맷
 *
 * 성공: ApiResponse.success(data)
 * 실패: ApiResponse.fail("메시지")
 */
@Getter
@AllArgsConstructor
public class ApiResponse<T> {

    private final boolean success;
    private final String message;
    private final T data;

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "요청 성공", data);
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    public static <T> ApiResponse<T> fail(String message) {
        return new ApiResponse<>(false, message, null);
    }
}
