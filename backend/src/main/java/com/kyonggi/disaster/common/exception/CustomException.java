package com.kyonggi.disaster.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/** 비즈니스 로직 예외 (Service 레이어에서 throw) */
@Getter
public class CustomException extends RuntimeException {

    private final HttpStatus status;

    public CustomException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    // 자주 쓰는 예외 팩토리 메서드
    public static CustomException notFound(String message) {
        return new CustomException(message, HttpStatus.NOT_FOUND);
    }

    public static CustomException badRequest(String message) {
        return new CustomException(message, HttpStatus.BAD_REQUEST);
    }

    public static CustomException conflict(String message) {
        return new CustomException(message, HttpStatus.CONFLICT);
    }
}
