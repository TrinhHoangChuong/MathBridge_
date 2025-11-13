package com.mathbridge.repository;

import com.mathbridge.entity.DangKyLH;
import com.mathbridge.entity.DangKyLHId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DangKyLHRepository extends JpaRepository<DangKyLH, DangKyLHId> {
    
    List<DangKyLH> findByTrangThai(String trangThai);

    @Query("SELECT d FROM DangKyLH d WHERE d.hocSinh.idHs = :idHS")
    List<DangKyLH> findByHocSinhId(@Param("idHS") String idHS);

    @Query("SELECT d FROM DangKyLH d WHERE d.lopHoc.idLh = :idLH")
    List<DangKyLH> findByLopHocId(@Param("idLH") String idLH);

    /**
     * Đếm số lượng đăng ký cho một lớp học cụ thể
     */
    @Query("SELECT COUNT(d) FROM DangKyLH d WHERE d.lopHoc.idLh = :idLH")
    long countByLopHocId(@Param("idLH") String idLH);

    long countByLopHoc_IdLh(String idLh);
}

