package com.mathbridge.repository.portaltutor;

import com.mathbridge.entity.LichSuThanhToan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TuLichSuThanhToanRepository extends JpaRepository<LichSuThanhToan, String> {
    
    // Lấy lịch sử thanh toán theo học sinh (qua hóa đơn)
    @Query("SELECT lst FROM LichSuThanhToan lst JOIN lst.hoaDons h WHERE h.hocSinh.idHs = :idHs ORDER BY lst.idLs DESC")
    List<LichSuThanhToan> findByStudentId(String idHs);
    
    // Lấy phần số lớn nhất của ID_LS dạng LS#####
    @Query(value = "SELECT ISNULL(MAX(TRY_CAST(SUBSTRING(ID_LS, 3, 10) AS INT)), 0) FROM LichSuThanhToan WHERE ID_LS LIKE 'LS%'", nativeQuery = true)
    int findMaxLsNumber();
}

