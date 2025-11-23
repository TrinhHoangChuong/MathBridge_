package com.mathbridge.dto.PortalAdmin.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO response cho module Tài chính (Portal Admin).
 * Chỉ dùng các field xuất ra FE, không thay đổi CSDL.
 */
public class TaiChinhResponse {

    // ================== HÓA ĐƠN (HoaDon) ==================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HoaDonDto {
        private String idHoaDon;       // ID_HoaDon
        private String idHs;           // ID_HS
        private String tenHocSinh;     // Ho + TenDem + Ten (HocSinh)
        private String idLh;           // ID_LH
        private String tenLop;         // TenLop (LopHoc)
        private String soThang;        // SoThang (nvarchar)
        private BigDecimal tongTien;   // TongTien (decimal)
        private LocalDate ngayDangKy;  // NgayDangKy (date)
        private LocalDate hanThanhToan;// HanThanhToan (date)
        private LocalDate ngayThanhToan; // NgayThanhToan (date)
        private String trangThai;      // TrangThai (nvarchar)
    }

    // ================== LỊCH SỬ THANH TOÁN (LichSuThanhToan) ==================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LichSuThanhToanDto {
        private String idLs;                 // ID_LS
        private String idPt;                 // ID_PT
        private String tenPt;                // TenPT (join PhuongThucThanhToan)
        private BigDecimal tongTien;         // TongTien
        private String trangThaiThanhToan;   // TrangThaiThanhToan
        private String hinhThuc;             // HinhThuc
        private String thang;                // Thang (nvarchar)
        private String ghiChu;               // GhiChu
    }

    // ================== PHƯƠNG THỨC THANH TOÁN (PhuongThucThanhToan) ==================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PhuongThucThanhToanDto {
        private String idPt;        // ID_PT
        private String tenPt;       // TenPT
        private String hinhThucTt;  // HinhThucTT
        private String ghiChu;      // GhiChu
    }

    // ================== DROPDOWN LỚP HỌC ==================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DropdownLopHocDto {
        private String idLh;    // ID_LH
        private String tenLop;  // TenLop
    }

    // ================== DROPDOWN HỌC SINH ==================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DropdownHocSinhDto {
        private String idHs;    // ID_HS
        private String hoTen;   // Ho + TenDem + Ten
    }
}
