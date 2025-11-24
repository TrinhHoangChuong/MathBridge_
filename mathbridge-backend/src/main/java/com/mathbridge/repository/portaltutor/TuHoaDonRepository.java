package com.mathbridge.repository.portaltutor;

import com.mathbridge.entity.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TuHoaDonRepository extends JpaRepository<HoaDon, String> {
    
    // Lấy tất cả hóa đơn chưa thanh toán (chỉ lấy khi chưa có ngày thanh toán)
    @Query("SELECT h FROM HoaDon h WHERE h.ngayThanhToan IS NULL AND (h.trangThai = 'Chua Thanh Toan' OR h.trangThai IS NULL)")
    List<HoaDon> findUnpaidInvoices();
    
    // Lấy hóa đơn chưa thanh toán theo học sinh
    @Query("SELECT h FROM HoaDon h WHERE h.ngayThanhToan IS NULL AND (h.trangThai = 'Chua Thanh Toan' OR h.trangThai IS NULL) AND h.hocSinh.idHs = :idHs")
    List<HoaDon> findUnpaidInvoicesByStudent(String idHs);
    
    // Lấy hóa đơn theo học sinh
    List<HoaDon> findByHocSinh_IdHs(String idHs);
    
    // Lấy phần số lớn nhất của ID_HoaDon dạng HD###
    @Query(value = "SELECT ISNULL(MAX(TRY_CAST(SUBSTRING(ID_HoaDon, 3, 10) AS INT)), 0) FROM HoaDon WHERE ID_HoaDon LIKE 'HD%'", nativeQuery = true)
    int findMaxHoaDonNumber();
}

