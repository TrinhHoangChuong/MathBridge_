package com.mathbridge.repository.Admin;

import com.mathbridge.entity.NhanVien;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NhanVienRepository extends JpaRepository<NhanVien, String> {

    long countByTrangThaiHoatDong(Boolean trangThaiHoatDong);
}
