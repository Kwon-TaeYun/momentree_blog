package com.likelion.momentreeblog.config.error;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.nio.file.AccessDeniedException;
import java.util.HashMap;
import java.util.Map;

public class GlobalExceptionError {
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("message", ex.getMessage());

        // 메시지에 따라 적절한 상태코드 선택도 가능
        if (ex.getMessage().contains("블로그를 찾을 수 없습니다")) {
            return ResponseEntity.status(HttpStatus.OK).body(body);
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body); // 기본은 400
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("message", ex.getMessage() != null ? ex.getMessage() : "권한이 없습니다.");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body); // 403
    }
}
