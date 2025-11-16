package com.mathbridge.repository.Admin;

import com.mathbridge.entity.HopDong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface HopDongRepository extends JpaRepository<HopDong, String> {

    long countByTrangThai(String trangThai);

    @Query("""
           SELECT COUNT(h)
           FROM HopDong h
           WHERE h.ngayHieuLuc <= :now
             AND h.ngayKetThuc >= :now
             AND (h.chamDutHd = false OR h.chamDutHd IS NULL)
           """)
    long countHopDongConHieuLuc(@Param("now") LocalDateTime now);
}
