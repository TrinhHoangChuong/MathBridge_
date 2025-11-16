package com.mathbridge.repository;

import com.mathbridge.entity.NhanVien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface NhanVienRepository extends JpaRepository<NhanVien, String> {
    
    /**
     * Tìm NhanVien theo ID_TK (TaiKhoan)
     */
    @Query("SELECT nv FROM NhanVien nv WHERE nv.taiKhoan.idTk = :idTk")
    Optional<NhanVien> findByTaiKhoan_IdTk(@Param("idTk") String idTk);
}
