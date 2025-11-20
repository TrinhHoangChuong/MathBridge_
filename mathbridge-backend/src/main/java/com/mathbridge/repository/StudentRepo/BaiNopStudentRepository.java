package com.mathbridge.repository.StudentRepo;

import com.mathbridge.entity.BaiNop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BaiNopStudentRepository extends JpaRepository<BaiNop, String> {
    
    List<BaiNop> findByHocSinh_IdHs(String idHS);
    
    @Query("SELECT bn FROM BaiNop bn WHERE bn.hocSinh.idHs = :idHS")
    List<BaiNop> findAllByHocSinhId(@Param("idHS") String idHS);

    Optional<BaiNop> findFirstByIdBnAndHocSinh_IdHs(String idBn, String idHs);

    Optional<BaiNop> findTopByBaiTap_IdBtAndHocSinh_IdHsOrderByThoiGianBatDauDesc(String idBT, String idHS);

    long countByBaiTap_IdBtAndHocSinh_IdHs(String idBT, String idHS);
}

