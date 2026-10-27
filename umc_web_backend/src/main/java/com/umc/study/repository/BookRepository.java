// src/main/java/.../repository/BookRepository.java
package com.umc.study.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.umc.study.entity.Book;

public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findAllByOrderByBookIdDesc();
}