package com.mathbridge.repository.portaltutor;

import com.mathbridge.entity.YeuCauHoTro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TuYeuCauHoTroRepository extends JpaRepository<YeuCauHoTro, String> {

    @Query("SELECT y FROM YeuCauHoTro y " +
           "LEFT JOIN FETCH y.hocSinh " +
           "LEFT JOIN FETCH y.lopHoc " +
           "ORDER BY y.thoiDiemTao DESC")
    List<YeuCauHoTro> findAllOrderByThoiDiemTaoDesc();

    @Query("SELECT y FROM YeuCauHoTro y " +
           "LEFT JOIN FETCH y.hocSinh " +
           "LEFT JOIN FETCH y.lopHoc " +
           "WHERE y.trangThai = :trangThai " +
           "ORDER BY y.thoiDiemTao DESC")
    List<YeuCauHoTro> findByTrangThaiOrderByThoiDiemTaoDesc(@Param("trangThai") String trangThai);

    @Query("SELECT y FROM YeuCauHoTro y " +
           "LEFT JOIN FETCH y.hocSinh " +
           "LEFT JOIN FETCH y.lopHoc " +
           "WHERE y.hocSinh.idHs = :idHs " +
           "ORDER BY y.thoiDiemTao DESC")
    List<YeuCauHoTro> findByHocSinhIdOrderByThoiDiemTaoDesc(@Param("idHs") String idHs);

    @Query("SELECT y FROM YeuCauHoTro y " +
           "LEFT JOIN FETCH y.hocSinh " +
           "LEFT JOIN FETCH y.lopHoc " +
           "WHERE y.thoiDiemDong IS NULL " +
           "ORDER BY y.thoiDiemTao DESC")
    List<YeuCauHoTro> findOpenRequestsOrderByThoiDiemTaoDesc();

    @Query("SELECT y FROM YeuCauHoTro y " +
           "LEFT JOIN FETCH y.hocSinh " +
           "LEFT JOIN FETCH y.lopHoc " +
           "WHERE y.loaiYeuCau = :loaiYeuCau " +
           "ORDER BY y.thoiDiemTao DESC")
    List<YeuCauHoTro> findByLoaiYeuCauOrderByThoiDiemTaoDesc(@Param("loaiYeuCau") String loaiYeuCau);
}
