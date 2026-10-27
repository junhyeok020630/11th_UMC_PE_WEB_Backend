// src/main/java/.../controller/RentalController.java
package com.umc.study.controller;

import com.umc.study.service.RentalService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController // 대여 기록을 JSON으로 서빙하는 API 카운터
@RequestMapping("/rentals") // 이 컨트롤러로 들어오는 요청의 기본 주소는 /rentals
@RequiredArgsConstructor
public class RentalController {

    // 대여 업무를 담당하는 주방장(Service)을 주입받습니다.
    private final RentalService rentalService;

    // GET http://localhost:8080/rentals
    @GetMapping
    public List<Map<String, Object>> getRentals() {
        return rentalService.getAllRentals();
    }

    // POST http://localhost:8080/rentals
    @PostMapping
    public String createRental(@RequestBody Map<String, Object> body) {
        rentalService.createRental(body);
        return "도서 대여 기록이 생성되었습니다!";
    }
}
