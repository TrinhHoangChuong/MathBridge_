package com.mathbridge.repository;

import com.mathbridge.entity.BuoiHocChiTiet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BuoiHocChiTietRepository extends JpaRepository<BuoiHocChiTiet, String> {
    
    @Query("SELECT bh FROM BuoiHocChiTiet bh WHERE bh.lopHoc.idLh = :idLh")
    List<BuoiHocChiTiet> findByLopHocId(@Param("idLh") String idLh);
    
    @Query("SELECT bh FROM BuoiHocChiTiet bh WHERE bh.lopHoc.nhanVien.idNv = :idNv")
    List<BuoiHocChiTiet> findByGiaoVienId(@Param("idNv") String idNv);
    
    @Query("SELECT bh FROM BuoiHocChiTiet bh WHERE bh.lopHoc.nhanVien.idNv = :idNv AND bh.ngayHoc >= :startDate AND bh.ngayHoc <= :endDate")
    List<BuoiHocChiTiet> findByGiaoVienAndDateRange(@Param("idNv") String idNv, 
                                                      @Param("startDate") LocalDateTime startDate,
                                                      @Param("endDate") LocalDateTime endDate);

    Optional<BuoiHocChiTiet> findFirstByLopHoc_IdLhOrderByNgayHocAsc(String idLh);
}

