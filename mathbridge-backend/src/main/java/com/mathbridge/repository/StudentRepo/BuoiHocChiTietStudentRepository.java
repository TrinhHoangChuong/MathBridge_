package com.mathbridge.repository.StudentRepo;

import com.mathbridge.entity.BuoiHocChiTiet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BuoiHocChiTietStudentRepository extends JpaRepository<BuoiHocChiTiet, String> {
    
    @Query("SELECT bh FROM BuoiHocChiTiet bh " +
           "LEFT JOIN FETCH bh.lopHoc " +
           "LEFT JOIN FETCH bh.phong " +
           "WHERE bh.lopHoc.idLh = :idLH")
    List<BuoiHocChiTiet> findByLopHoc_IdLh(@Param("idLH") String idLH);

    @Query("SELECT bh FROM BuoiHocChiTiet bh " +
           "LEFT JOIN FETCH bh.lopHoc " +
           "LEFT JOIN FETCH bh.phong " +
           "WHERE bh.lopHoc.idLh IN " +
           "(SELECT dk.lopHoc.idLh FROM DangKyLH dk WHERE dk.hocSinh.idHs = :idHS) " +
           "ORDER BY bh.ngayHoc DESC")
    List<BuoiHocChiTiet> findByHocSinhId(@Param("idHS") String idHS);
}

