package com.mathbridge.repository.Admin;

import com.mathbridge.entity.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;

public interface HoaDonRepository extends JpaRepository<HoaDon, String> {

    @Query("SELECT COALESCE(SUM(h.tongTien), 0) FROM HoaDon h")
    BigDecimal sumTongTien();
}
