package com.mathbridge.repository.StudentRepo;

import com.mathbridge.entity.DanhGiaBuoiHoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DanhGiaBuoiHocStudentRepository extends JpaRepository<DanhGiaBuoiHoc, String> {
    
    // Find by student ID
    List<DanhGiaBuoiHoc> findByHocSinh_IdHs(String idHS);
    
    // Find by session ID (ID_BH)
    List<DanhGiaBuoiHoc> findByBuoiHocChiTiet_IdBh(String idBh);
    
    // Find by student ID and session ID
    @Query("SELECT dg FROM DanhGiaBuoiHoc dg WHERE dg.hocSinh.idHs = :idHS AND dg.buoiHocChiTiet.idBh = :idBh")
    Optional<DanhGiaBuoiHoc> findByHocSinhIdAndBuoiHocChiTietId(@Param("idHS") String idHS, @Param("idBh") String idBh);
    
    // Find all ordered by time descending
    @Query("SELECT dg FROM DanhGiaBuoiHoc dg ORDER BY dg.thoiDiemDanhGia DESC")
    List<DanhGiaBuoiHoc> findAllOrderByThoiDiemDanhGiaDesc();

    // Lấy phần số lớn nhất của ID_DGBH dạng DGBH### (DGBH + số tuần tự)
    @Query(value = "SELECT ISNULL(MAX(CASE " +
                   "WHEN LEN(ID_DGBH) = 10 AND ISNUMERIC(SUBSTRING(ID_DGBH, 5, 6)) = 1 " +
                   "THEN TRY_CAST(SUBSTRING(ID_DGBH, 5, 6) AS INT) " +
                   "ELSE 0 END), 0) " +
                   "FROM DanhGiaBuoiHoc WHERE ID_DGBH LIKE 'DGBH%'", nativeQuery = true)
    int findMaxDgbhNumber();
}

