// src/main/java/.../service/RentalService.java
package com.umc.study.service;

import com.umc.study.repository.RentalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service // 대여 관련 비즈니스 로직을 수행하는 메인 셰프 계층
@RequiredArgsConstructor
public class RentalService {

    // 대여 기록 창고지기(Repository)를 생성자 주입으로 데려옵니다.
    private final RentalRepository rentalRepository;

    public List<Map<String, Object>> getAllRentals() {
        // 창고지기가 가져온 대여 기록을 별도 가공 없이 반환합니다.
        return rentalRepository.findAll();
    }

    public void createRental(Map<String, Object> body) {
        rentalRepository.save(body);
    }
}
