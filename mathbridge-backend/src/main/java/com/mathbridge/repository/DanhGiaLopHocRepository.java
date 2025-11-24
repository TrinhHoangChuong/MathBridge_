package com.mathbridge.repository;

import com.mathbridge.entity.DanhGiaLopHoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface DanhGiaLopHocRepository extends JpaRepository<DanhGiaLopHoc, String> {

    List<DanhGiaLopHoc> findByIdLhOrderByThoiDiemDanhGiaDesc(String idLh);

    @Query("""
            SELECT dg.idLh, AVG(CAST(dg.diemDanhGia AS double)), COUNT(dg)
            FROM DanhGiaLopHoc dg
            WHERE dg.idLh IN :classIds
            GROUP BY dg.idLh
            """)
    List<Object[]> findStatsByClassIds(@Param("classIds") Collection<String> classIds);
}

