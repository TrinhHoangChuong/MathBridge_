package com.mathbridge.repository.Admin;

import com.mathbridge.entity.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface HoaDonAdminRepository extends JpaRepository<HoaDon, String> {

    @Query("SELECT COALESCE(SUM(h.tongTien), 0) FROM HoaDon h")
    BigDecimal sumTongTien();

    // HoaDonRepository (bổ sung)
    List<HoaDon> findByLopHoc_IdLh(String idLh);

    long countByLopHoc_IdLh(String idLh);
}
