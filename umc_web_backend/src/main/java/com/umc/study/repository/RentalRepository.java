// src/main/java/.../repository/RentalRepository.java
package com.umc.study.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository // 스프링 컨테이너에 대여 기록 창고지기 부품으로 등록
@RequiredArgsConstructor
public class RentalRepository {

    // 스프링의 DB 통신 도구(JdbcTemplate)를 주입받습니다.
    private final JdbcTemplate jdbcTemplate;

    public List<Map<String, Object>> findAll() {
        String sql = "SELECT * FROM rental";

        // 모든 대여 기록을 List<Map> 형태의 날것 데이터로 가져옵니다.
        return jdbcTemplate.queryForList(sql);
    }

    public void save(Map<String, Object> body) {
        // 대여 시각은 현재 시간, 반납 예정 시각은 현재 시간으로부터 7일 뒤로 저장합니다.
        String sql = "INSERT INTO rental (user_id, book_id, rented_at, due_at) "
                + "VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY))";

        // SQL의 ? 자리에 userId와 bookId를 순서대로 안전하게 바인딩합니다.
        jdbcTemplate.update(
                sql,
                body.get("userId"),
                body.get("bookId")
        );
    }
}
