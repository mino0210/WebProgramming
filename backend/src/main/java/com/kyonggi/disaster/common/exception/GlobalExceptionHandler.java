package com.kyonggi.disaster.common.exception;

import com.kyonggi.disaster.common.response.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** 전역 예외 처리 — 모든 Controller 예외를 여기서 잡음 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ErrorResponse> handleCustomException(CustomException e) {
        log.warn("[CustomException] {}", e.getMessage());
        return ResponseEntity
                .status(e.getStatus())
                .body(new ErrorResponse(e.getStatus().value(), e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        log.warn("[ValidationException] {}", message);
        return ResponseEntity.badRequest()
                .body(new ErrorResponse(400, message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e) {
        log.error("[Exception] {}", e.getMessage(), e);
        return ResponseEntity.internalServerError()
                .body(new ErrorResponse(500, "서버 오류가 발생했습니다."));
    }
}
