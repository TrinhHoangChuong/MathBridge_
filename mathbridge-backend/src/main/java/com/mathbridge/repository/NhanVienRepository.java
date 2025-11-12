package com.mathbridge.repository;

import com.mathbridge.entity.NhanVien;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NhanVienRepository extends JpaRepository<NhanVien, String> {

    Optional<NhanVien> findFirstByTaiKhoan_IdTk(String idTk);
}
