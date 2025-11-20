package com.mathbridge.repository;

import com.mathbridge.entity.NhanVien;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NhanVienRepository extends JpaRepository<NhanVien, String> {

    long countByTrangThaiHoatDong(boolean b);

    Optional<NhanVien> findByTaiKhoan_IdTk(String idTk);
}
