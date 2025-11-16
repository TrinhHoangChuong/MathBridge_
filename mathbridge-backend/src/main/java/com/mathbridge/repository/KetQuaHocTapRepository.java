package com.mathbridge.repository;

import com.mathbridge.entity.KetQuaHocTap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KetQuaHocTapRepository extends JpaRepository<KetQuaHocTap, String> {
    
    @Query("SELECT kq FROM KetQuaHocTap kq WHERE kq.hocSinh.idHs = :idHs")
    List<KetQuaHocTap> findByHocSinhId(@Param("idHs") String idHs);
}

