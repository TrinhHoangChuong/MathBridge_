package com.mathbridge.repository;

import com.mathbridge.entity.TaiKhoan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, String> {

    Optional<TaiKhoan> findByEmail(String email);

    // Đăng ký/tạo tài khoản xem email đã tồn tại chưa
    boolean existsByEmail(String email);
}
