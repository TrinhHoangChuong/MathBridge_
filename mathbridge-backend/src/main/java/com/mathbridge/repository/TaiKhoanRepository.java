package com.mathbridge.repository;

import com.mathbridge.entity.TaiKhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, String> {

    Optional<TaiKhoan> findByEmail(String email);
    boolean existsByEmail(String email);

    // Lấy phần số lớn nhất của ID_TK dạng TK###
    @Query(value = "SELECT ISNULL(MAX(TRY_CAST(SUBSTRING(ID_TK, 3, 10) AS INT)), 0) FROM TaiKhoan WHERE ID_TK LIKE 'TK%'", nativeQuery = true)
    int findMaxTkNumber();
}
