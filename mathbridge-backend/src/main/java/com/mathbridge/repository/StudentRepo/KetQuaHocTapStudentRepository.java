package com.mathbridge.repository.StudentRepo;

import com.mathbridge.entity.KetQuaHocTap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KetQuaHocTapStudentRepository extends JpaRepository<KetQuaHocTap, String> {
    
    List<KetQuaHocTap> findByHocSinh_IdHs(String idHS);
    
    @Query("SELECT kq FROM KetQuaHocTap kq WHERE kq.hocSinh.idHs = :idHS ORDER BY kq.idKq DESC")
    List<KetQuaHocTap> findByHocSinhIdOrderByIdDesc(@Param("idHS") String idHS);
}

