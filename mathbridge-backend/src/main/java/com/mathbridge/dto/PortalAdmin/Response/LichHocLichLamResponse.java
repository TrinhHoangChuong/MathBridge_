package com.mathbridge.dto.PortalAdmin.Response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO response cho module Lịch học & Lịch làm.
 * Gom nhiều DTO con theo đúng nhu cầu FE.
 */
public class LichHocLichLamResponse {

    /* ========= CLASS OPTIONS / DETAIL ========= */

    /**
     * Thông tin lớp cho dropdown & options.
     * Dựa vào bảng LopHoc + NhanVien.
     */
    @Data
    @Builder
    public static class ClassOptionResponse {
        private String idLh;          // ID_LH
        private String tenLop;        // TenLop
        private String loaiNgay;      // LoaiNgay
        private String soBuoi;        // SoBuoi (varchar trong DB)
        private LocalDate ngayBatDau; // NgayBatDau
        private String hinhThucHoc;   // HinhThucHoc

        private String idNv;          // ID_NV (NhanVien)
        private String tenGiangVien;  // Họ tên ghép từ bảng NhanVien

        private String idCt;          // ID_CT (ChuongTrinh)
        private String tenChuongTrinh;
    }

    /**
     * Chi tiết 1 lớp (dùng cho auto-generate form).
     */
    @Data
    @Builder
    public static class ClassDetailResponse {
        private String idLh;
        private String tenLop;
        private String loaiNgay;
        private String soBuoi;
        private LocalDate ngayBatDau;
        private String hinhThucHoc;

        private String idNv;
        private String tenGiangVien;

        private String idCt;
        private String tenChuongTrinh;
    }

    /* ========= CLASS SCHEDULE ========= */

    /**
     * 1 dòng lịch của lớp (từ BuoiHocChiTiet + Phong + CoSo).
     * Dùng cho: bảng "Danh sách buổi học".
     */
    @Data
    @Builder
    public static class ClassScheduleItemResponse {
        private String idBh;          // ID_BH
        private String idLh;          // ID_LH

        private String thuTuBuoiHoc;  // ThuTuBuoiHoc
        private LocalDate ngayHoc;    // từ BuoiHocChiTiet.NgayHoc
        private LocalDateTime gioBatDau;
        private LocalDateTime gioKetThuc;
        private String tenCaHoc;      // TenCaHoc

        private String idPhong;       // ID_Phong
        private String tenPhong;      // Phong.TenPhong
        private String tang;          // Phong.Tang
        private String idCs;          // CoSo.ID_CS
        private String tenCoSo;       // CoSo.TENCOSO

        private String noiDung;       // NoiDung
        private String ghiChu;        // GhiChu
    }

    /**
     * Kết quả auto-generate lịch.
     */
    @Data
    @Builder
    public static class AutoGenerateResultResponse {
        private int createdCount;         // số buổi mới insert
        private int skippedCount;         // số buổi bỏ qua (trùng ID, v.v.)
        private List<ConflictInfo> conflicts; // danh sách xung đột phòng / giáo viên
    }

    /**
     * Thông tin 1 xung đột lịch khi auto-generate.
     */
    @Data
    @Builder
    public static class ConflictInfo {
        private String type;          // "ROOM" / "TEACHER"
        private String message;       // mô tả ngắn
        private String idLh;          // lớp liên quan
        private String idBh;          // nếu có
        private String idPhong;       // nếu là conflict phòng
        private String idNv;          // nếu là conflict giáo viên
        private LocalDateTime gioBatDau;
        private LocalDateTime gioKetThuc;
    }

    /* ========= CAMPUS & ROOM ========= */

    @Data
    @Builder
    public static class CampusOptionResponse {
        private String idCs;      // ID_CS
        private String tenCoSo;   // TENCOSO
        private String diaChi;    // DIACHI2
    }

    @Data
    @Builder
    public static class RoomOptionResponse {
        private String idPhong;   // ID_Phong
        private String tenPhong;  // TenPhong
        private String tang;      // Tang
        private String loaiPhong; // LoaiPhong
    }

    /* ========= TEACHER VIEW ========= */

    @Data
    @Builder
    public static class TeacherOptionResponse {
        private String idNv;      // ID_NV
        private String hoTen;     // ghép Ho + TenDem + Ten
        private String email;     // Email
        private String idCs;      // ID_CS
    }

    @Data
    @Builder
    public static class TeacherScheduleItemResponse {
        private String idBh;          // ID_BH
        private String idLh;          // ID_LH
        private LocalDate ngayHoc;
        private LocalDateTime gioBatDau;
        private LocalDateTime gioKetThuc;

        private String tenLop;        // LopHoc.TenLop
        private String idCt;          // ID_CT
        private String tenChuongTrinh;

        private String idPhong;
        private String tenPhong;
        private String idCs;
        private String tenCoSo;
    }

    /* ========= STUDENT VIEW ========= */

    @Data
    @Builder
    public static class StudentOptionResponse {
        private String idHs;      // ID_HS
        private String hoTen;     // ghép Ho + TenDem + Ten
        private String email;     // Email
    }

    @Data
    @Builder
    public static class StudentScheduleItemResponse {
        private String idBh;
        private String idLh;
        private LocalDate ngayHoc;
        private LocalDateTime gioBatDau;
        private LocalDateTime gioKetThuc;

        private String tenLop;
        private String idCt;
        private String tenChuongTrinh;

        private String idPhong;
        private String tenPhong;
        private String idCs;
        private String tenCoSo;
    }
}
