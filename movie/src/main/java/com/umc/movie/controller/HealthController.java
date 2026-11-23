package com.umc.movie.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 애플리케이션 상태 확인 API입니다.
 *
 * @author 최준혁
 */
@RestController
@Tag(name = "상태 확인", description = "애플리케이션 상태 확인 API")
public class HealthController {

    @Operation(
            summary = "서버 상태 확인",
            description = "로드 밸런서와 운영자가 서버의 정상 응답 여부를 확인하는 공개 API입니다."
    )
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }
}
