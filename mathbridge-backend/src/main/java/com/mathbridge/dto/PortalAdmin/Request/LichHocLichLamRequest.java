package com.mathbridge.dto.PortalAdmin.Request;

import lombok.Data;

import java.time.LocalDate;

/**
 * DTO request cho module Lịch học & Lịch làm.
 * Gom nhiều request nhỏ thành các lớp static bên trong,
 * đúng với các payload mà FE đang gọi.
 */
public class LichHocLichLamRequest {

    /**
     * Tìm lịch của 1 lớp (class view).
     * Dùng cho: POST /class-schedule/search
     */
    @Data
    public static class ClassScheduleSearchRequest {
        private String idLh;      // ID_LH
        private LocalDate fromDate;
        private LocalDate toDate;
    }

    /**
     * Tự động sinh BuoiHocChiTiet cho 1 lớp.
     * Dùng cho: POST /class-schedule/auto-generate
     */
    @Data
    public static class ClassScheduleAutoGenerateRequest {
        private String idLh;          // ID_LH
        private Integer soBuoi;       // SoBuoi
        private String loaiNgay;      // LoaiNgay (pattern: "2-4-6", "3-5-7", ...)
        private LocalDate ngayBatDau; // NgayBatDau
        private String hinhThucHoc;   // HinhThucHoc (chỉ dùng để tham chiếu/hiển thị)

        private String idCs;          // ID_CS (CoSo)
        private String idPhong;       // ID_Phong (Phong)

        private String tenCaHoc;      // TenCaHoc
        private String gioBatDau;     // "HH:mm"
        private String gioKetThuc;    // "HH:mm"
    }

    /**
     * Tìm lịch giáo viên.
     * Dùng cho: POST /teacher-schedule/search
     */
    @Data
    public static class TeacherScheduleSearchRequest {
        private String idNv;      // ID_NV (NhanVien)
        private LocalDate fromDate;
        private LocalDate toDate;
    }

    /**
     * Tìm lịch học sinh.
     * Dùng cho: POST /student-schedule/search
     */
    @Data
    public static class StudentScheduleSearchRequest {
        private String idHs;      // ID_HS (HocSinh)
        private LocalDate fromDate;
        private LocalDate toDate;
    }

    @Data
    public static class UpdateSessionRequest {
        // ID buổi cần sửa
        private String idBh;

        // Giá trị mới
        private String idPhong;     // ID_Phong mới (phòng nằm trong cơ sở đã chọn)
        private LocalDate ngayHoc;  // Ngày học mới
        private String gioBatDau;   // "HH:mm"
        private String gioKetThuc;  // "HH:mm"
        private String tenCaHoc;    // TenCaHoc (nếu muốn đổi tên ca)
        private String noiDung;     // Nội dung buổi
        private String ghiChu;      // Ghi chú
    }
}
