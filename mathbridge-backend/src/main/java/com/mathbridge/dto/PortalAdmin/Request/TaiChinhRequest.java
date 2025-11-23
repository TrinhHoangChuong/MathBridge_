package com.mathbridge.dto.PortalAdmin.Request;

import lombok.Data;

import java.math.BigDecimal;

/**
 * DTO request cho module Tài chính (Portal Admin).
 * Các class con tương ứng từng API mà FE gọi.
 */
public class TaiChinhRequest {

    // ================== HÓA ĐƠN (SEARCH) ==================

    @Data
    public static class HoaDonSearchRequest {
        private String studentId; // ID_HS
        private String classId;   // ID_LH
        private String status;    // TrangThai
        private String fromDate;  // yyyy-MM-dd (lọc NgayDangKy >=)
        private String toDate;    // yyyy-MM-dd (lọc NgayDangKy <=)
    }

    // ================== HÓA ĐƠN (CREATE/UPDATE) ==================

    @Data
    public static class HoaDonUpsertRequest {
        private String idHoaDon;       // ID_HoaDon (nếu null -> FE phải tự truyền / sau này bổ sung logic sinh mã)
        private String idHs;           // ID_HS
        private String idLh;           // ID_LH
        private String soThang;        // SoThang (nvarchar)
        private BigDecimal tongTien;   // TongTien
        private String ngayDangKy;     // yyyy-MM-dd
        private String hanThanhToan;   // yyyy-MM-dd
        private String ngayThanhToan;  // yyyy-MM-dd (optional)
        private String trangThai;      // TrangThai
    }

    // ================== LỊCH SỬ THANH TOÁN (SEARCH) ==================

    @Data
    public static class LichSuSearchRequest {
        private String status;    // TrangThaiThanhToan
        private String methodId;  // ID_PT
        private String month;     // Thang
    }

    // ================== LỊCH SỬ THANH TOÁN (CREATE/UPDATE) ==================

    @Data
    public static class LichSuUpsertRequest {
        private String idLs;                 // ID_LS
        private String idPt;                 // ID_PT
        private BigDecimal tongTien;         // TongTien
        private String trangThaiThanhToan;   // TrangThaiThanhToan
        private String hinhThuc;             // HinhThuc
        private String thang;                // Thang
        private String ghiChu;               // GhiChu
    }

    // ================== PHƯƠNG THỨC THANH TOÁN (CREATE/UPDATE) ==================

    @Data
    public static class PhuongThucUpsertRequest {
        private String idPt;        // ID_PT
        private String tenPt;       // TenPT
        private String hinhThucTt;  // HinhThucTT
        private String ghiChu;      // GhiChu
    }
}
