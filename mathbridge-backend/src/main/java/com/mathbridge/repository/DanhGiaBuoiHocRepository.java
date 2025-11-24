package com.mathbridge.repository;

import com.mathbridge.entity.DanhGiaBuoiHoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface DanhGiaBuoiHocRepository extends JpaRepository<DanhGiaBuoiHoc, String> {

    List<DanhGiaBuoiHoc> findByIdBhOrderByThoiDiemDanhGiaDesc(String idBh);

    @Query("""
            SELECT dg.idBh, AVG(CAST(dg.diemDanhGia AS double)), COUNT(dg)
            FROM DanhGiaBuoiHoc dg
            WHERE dg.idBh IN :sessionIds
            GROUP BY dg.idBh
            """)
    List<Object[]> findStatsBySessionIds(@Param("sessionIds") Collection<String> sessionIds);
}

