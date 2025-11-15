package com.mathbridge.repository.StudentRepo;

import com.mathbridge.entity.YeuCauHoTro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface YeuCauHoTroRepository extends JpaRepository<YeuCauHoTro, String> {

    // Find support requests by student ID (assuming we need to link to student somehow)
    // Since YeuCauHoTro doesn't have direct student reference, we might need to add it
    // For now, we'll create methods that can be extended later

    // Find by status
    List<YeuCauHoTro> findByTrangThai(String trangThai);

    // Find by type
    List<YeuCauHoTro> findByLoaiYeuCau(String loaiYeuCau);

    // Find by class
    List<YeuCauHoTro> findByLopHoc_IdLh(String idLh);

    // Custom query to find recent support requests
    @Query("SELECT y FROM YeuCauHoTro y ORDER BY y.thoiDiemTao DESC")
    List<YeuCauHoTro> findAllOrderByThoiDiemTaoDesc();

    // Find by status and order by creation date
    @Query("SELECT y FROM YeuCauHoTro y WHERE y.trangThai = :trangThai ORDER BY y.thoiDiemTao DESC")
    List<YeuCauHoTro> findByTrangThaiOrderByThoiDiemTaoDesc(@Param("trangThai") String trangThai);

    // Lấy phần số lớn nhất của ID_YC dạng YC###
    // Xử lý cả ID cũ (YC + timestamp) và ID mới (YC + số tuần tự)
    // Chỉ lấy các ID có format YC + số (tối đa 8 số sau YC)
    @Query(value = "SELECT ISNULL(MAX(CASE " +
                   "WHEN LEN(ID_YC) = 10 AND ISNUMERIC(SUBSTRING(ID_YC, 3, 8)) = 1 " +
                   "THEN TRY_CAST(SUBSTRING(ID_YC, 3, 8) AS INT) " +
                   "ELSE 0 END), 0) " +
                   "FROM YeuCauHoTro WHERE ID_YC LIKE 'YC%'", nativeQuery = true)
    int findMaxYcNumber();
}