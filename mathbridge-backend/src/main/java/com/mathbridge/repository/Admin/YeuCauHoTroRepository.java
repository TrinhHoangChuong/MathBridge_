package com.mathbridge.repository.Admin;

import com.mathbridge.entity.YeuCauHoTro;
import org.springframework.data.jpa.repository.JpaRepository;

public interface YeuCauHoTroRepository extends JpaRepository<YeuCauHoTro, String> {

    long countByThoiDiemDongIsNull();

    long countByThoiDiemDongIsNotNull();
}
