package com.mathbridge.repository;

import com.mathbridge.entity.BaiTap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BaiTapRepository extends JpaRepository<BaiTap, String> {
    
    @Query("SELECT bt FROM BaiTap bt WHERE bt.buoiHocChiTiet.lopHoc.idLh = :idLh")
    List<BaiTap> findByLopHocId(@Param("idLh") String idLh);
    
    @Query("SELECT bt FROM BaiTap bt WHERE bt.buoiHocChiTiet.idBh = :idBh")
    List<BaiTap> findByBuoiHocId(@Param("idBh") String idBh);
    
    // Find assignments by teacher - try through buoiHocChiTiet relationship
    @Query("SELECT bt FROM BaiTap bt WHERE bt.buoiHocChiTiet.lopHoc.nhanVien.idNv = :idNv")
    List<BaiTap> findByGiaoVienId(@Param("idNv") String idNv);
    
    // Alternative: Find all assignments and filter in service (if buoiHocChiTiet is null)
    @Query("SELECT bt FROM BaiTap bt")
    List<BaiTap> findAll();
}

