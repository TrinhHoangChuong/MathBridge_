package com.mathbridge.repository;

import com.mathbridge.entity.BaiNop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BaiNopRepository extends JpaRepository<BaiNop, String> {
    
    @Query("SELECT bn FROM BaiNop bn WHERE bn.baiTap.idBt = :idBt")
    List<BaiNop> findByBaiTapId(@Param("idBt") String idBt);
    
    @Query("SELECT bn FROM BaiNop bn WHERE bn.hocSinh.idHs = :idHs")
    List<BaiNop> findByHocSinhId(@Param("idHs") String idHs);
    
    @Query("SELECT bn FROM BaiNop bn WHERE bn.baiTap.idBt = :idBt AND bn.hocSinh.idHs = :idHs")
    Optional<BaiNop> findByBaiTapAndHocSinh(@Param("idBt") String idBt, @Param("idHs") String idHs);
    
    @Query("SELECT COUNT(bn) FROM BaiNop bn WHERE bn.baiTap.idBt = :idBt")
    long countByBaiTapId(@Param("idBt") String idBt);
    
    @Query("SELECT COUNT(bn) FROM BaiNop bn WHERE bn.baiTap.idBt = :idBt AND bn.diemSo IS NOT NULL")
    long countBaiDaChamByBaiTapId(@Param("idBt") String idBt);
}

