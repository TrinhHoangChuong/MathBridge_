package com.mathbridge.repository;

import com.mathbridge.entity.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HoaDonRepository extends JpaRepository<HoaDon, String> {
    // Tìm hóa đơn theo học sinh
    List<HoaDon> findByHocSinh_IdHs(String idHs);
    
    // Tìm hóa đơn theo lớp học
    List<HoaDon> findByLopHoc_IdLh(String idLh);
    
    // Tìm hóa đơn theo trạng thái
    List<HoaDon> findByTrangThai(String trangThai);
    
    // Lấy phần số lớn nhất của ID_HoaDon dạng HD###
    @org.springframework.data.jpa.repository.Query(
        value = "SELECT ISNULL(MAX(TRY_CAST(SUBSTRING(ID_HoaDon, 3, 10) AS INT)), 0) FROM HoaDon WHERE ID_HoaDon LIKE 'HD%'",
        nativeQuery = true
    )
    int findMaxHdNumber();
}

