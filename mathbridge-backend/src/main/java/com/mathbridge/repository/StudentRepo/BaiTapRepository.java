package com.mathbridge.repository.StudentRepo;

import com.mathbridge.entity.BaiTap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BaiTapRepository extends JpaRepository<BaiTap, String> {
    
    @Query("SELECT bt FROM BaiTap bt WHERE bt.buoiHocChiTiet.lopHoc.idLh IN " +
           "(SELECT dk.lopHoc.idLh FROM DangKyLH dk WHERE dk.hocSinh.idHs = :idHS)")
    List<BaiTap> findByHocSinhId(@Param("idHS") String idHS);

    @Query("SELECT bt FROM BaiTap bt WHERE bt.buoiHocChiTiet.lopHoc.idLh = :idLH")
    List<BaiTap> findByLopHocId(@Param("idLH") String idLH);
}

