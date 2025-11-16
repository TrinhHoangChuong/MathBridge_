package com.mathbridge.repository.Admin;

import com.mathbridge.entity.NhanVien;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NhanVienAdminRepository extends JpaRepository<NhanVien, String> {
}
