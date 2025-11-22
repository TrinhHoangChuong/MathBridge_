package com.mathbridge.dto.PortalAdmin.Request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Dồn tất cả request liên quan tới module Tuyển dụng vào đây.
 */

public class TuyenDungRequest {

    /**
     * Request tạo / cập nhật tin tuyển dụng (bảng TinTuyenDung).
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobCreateOrUpdate {
        private String idTd;            // ID_TD
        private String tieuDe;          // TieuDe
        private String viTri;           // ViTri
        private String moTaNgan;        // MoTaNgan
        private String moTa;            // MoTa
        private String yeuCau;          // YeuCau
        private String capBac;          // CapBac
        private String hinhThucLamViec; // HinhThucLamViec
        private String mucLuongTu;      // MucLuongTu (nvarchar)
        private String mucLuongDen;     // MucLuongDen (nvarchar)
        private Integer kinhNghiem;     // KinhNghiem (int)
        private Integer soLuongTuyen;   // SoLuongTuyen (int)
        private LocalDateTime hanNop;   // HanNop (datetime)
        private String trangThai;       // TrangThai
    }

    /**
     * Request tạo / cập nhật ứng viên (bảng UngVien).
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CandidateCreateOrUpdate {
        private String idUv;          // ID_UV
        private String hoTen;         // HoTen
        private String email;         // Email
        private String sdt;           // SDT
        private String cvUrl;         // CV_URL
        private String trangThaiHoSo; // TrangThaiHoSo
        private String linkProfile;   // LinkProfile
        private String ghiChu;        // GhiChu
    }

    /**
     * Request ghép ứng viên vào 1 tin (bảng Association_25).
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MappingCreate {
        private String idTd;                // tin tuyển dụng
        private List<String> candidateIds;  // danh sách ID_UV
    }
}
