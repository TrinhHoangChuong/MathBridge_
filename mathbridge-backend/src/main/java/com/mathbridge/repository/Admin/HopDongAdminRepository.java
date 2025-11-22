package com.mathbridge.repository.Admin;

import com.mathbridge.entity.HopDong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface HopDongAdminRepository extends JpaRepository<HopDong, String> {

    long countByTrangThai(String trangThai);

    @Query("""
           SELECT COUNT(h)
           FROM HopDong h
           WHERE h.ngayHieuLuc <= :now
             AND h.ngayKetThuc >= :now
             AND (h.chamDutHd = false OR h.chamDutHd IS NULL)
           """)
    long countHopDongConHieuLuc(@Param("now") LocalDateTime now);

    List<HopDong> findByIdNv(String idNv);

    /**
     * Lấy tất cả Hợp đồng của 1 nhân viên theo ID_NV.
     * Dùng cho trang chi tiết nhân sự (tab Hợp đồng).
     */
    @Query(value = """
            SELECT * 
            FROM HopDong 
            WHERE ID_NV = :idNv 
            ORDER BY NgayHieuLuc DESC
            """, nativeQuery = true)
    List<HopDong> findByNhanVienId(@Param("idNv") String idNv);

    /**
     * Lấy Hợp đồng hiện tại (chưa chấm dứt, hoặc trạng thái còn hiệu lực) của 1 nhân viên.
     * Ở đây tạm hiểu "current" = ChamDutHD IS NULL OR ChamDutHD = 0, ưu tiên HĐ mới nhất.
     */
    @Query(value = """
            SELECT TOP 1 * 
            FROM HopDong 
            WHERE ID_NV = :idNv 
              AND (ChamDutHD IS NULL OR ChamDutHD = 0)
            ORDER BY NgayHieuLuc DESC
            """, nativeQuery = true)
    Optional<HopDong> findCurrentActiveByNhanVienId(@Param("idNv") String idNv);

    long countByIdNv(String idNv);
}
