package com.mathbridge.repository.Admin;

import com.mathbridge.entity.BinhLuanBaiNop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BinhLuanBaiNopAdminRepository extends JpaRepository<BinhLuanBaiNop, String> {

    /**
     * Đếm số comment trên 1 bài nộp (BaiNop.ID_BN).
     * Bảng: BinhLuanBaiNop(ID_BL, ID_BN, ID_TK_Gui, ...)
     */
    long countByIdBn(String idBn);
}
