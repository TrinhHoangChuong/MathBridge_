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
    
    @Query("SELECT bn FROM BaiNop bn WHERE bn.baiTap.idBt = :idBT AND bn.hocSinh.idHs = :idHS")
    Optional<BaiNop> findByBaiTapAndHocSinh(@Param("idBT") String idBT, @Param("idHS") String idHS);
    
    @Query("SELECT bn FROM BaiNop bn WHERE bn.hocSinh.idHs = :idHS")
    List<BaiNop> findAllByHocSinhId(@Param("idHS") String idHS);
}

