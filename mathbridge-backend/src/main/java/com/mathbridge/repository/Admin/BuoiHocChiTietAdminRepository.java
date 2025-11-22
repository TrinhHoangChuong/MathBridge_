package com.mathbridge.repository.Admin;

import com.mathbridge.entity.BuoiHocChiTiet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * Repository cho bảng BuoiHocChiTiet dùng trong portal admin.
 * Dựa 100% cột của bảng [dbo].[BuoiHocChiTiet].
 */
@Repository
public interface BuoiHocChiTietAdminRepository extends JpaRepository<BuoiHocChiTiet, String> {

    // Lấy buổi học theo lớp
    List<BuoiHocChiTiet> findByIdLh(String idLh);

    // Lấy buổi học theo lớp + khoảng ngày (dùng cho filter class view)
    List<BuoiHocChiTiet> findByIdLhAndNgayHocBetween(
            String idLh,
            LocalDateTime from,
            LocalDateTime to
    );

    // Lấy buổi học theo phòng + đúng ngày (dùng check conflict phòng)
    List<BuoiHocChiTiet> findByIdPhongAndNgayHoc(
            String idPhong,
            LocalDateTime ngayHoc
    );

    // Lấy buổi học theo nhiều lớp + khoảng ngày (dùng cho teacher/student view)
    List<BuoiHocChiTiet> findByIdLhInAndNgayHocBetween(
            Collection<String> idLhs,
            LocalDateTime from,
            LocalDateTime to
    );

    // Nếu không có from/to, dùng method này để lấy tất cả theo nhiều lớp
    List<BuoiHocChiTiet> findByIdLhIn(Collection<String> idLhs);

}
