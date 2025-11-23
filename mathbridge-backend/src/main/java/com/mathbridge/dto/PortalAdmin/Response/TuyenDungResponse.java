package com.mathbridge.dto.PortalAdmin.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Dồn tất cả response liên quan tới module Tuyển dụng vào đây.
 */
public class TuyenDungResponse {

    // ===================== JOB =====================

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class JobSummary {
        private String idTd;
        private String tieuDe;
        private String viTri;
        private String capBac;
        private String mucLuongTu;
        private String mucLuongDen;
        private Integer kinhNghiem;
        private Integer soLuongTuyen;
        private LocalDateTime hanNop;
        private String trangThai;

        // số ứng viên đã apply (từ Association_25)
        private Long soUngVien;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class JobDetail {
        private String idTd;
        private String tieuDe;
        private String viTri;
        private String moTaNgan;
        private String moTa;
        private String yeuCau;
        private String capBac;
        private String hinhThucLamViec;
        private String mucLuongTu;
        private String mucLuongDen;
        private Integer kinhNghiem;
        private Integer soLuongTuyen;
        private LocalDateTime hanNop;
        private String trangThai;

        private Long soUngVien;
        private List<CandidateSummary> danhSachUngVien; // join từ Association_25 + UngVien
    }

    // ===================== CANDIDATE =====================

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CandidateSummary {
        private String idUv;
        private String hoTen;
        private String email;
        private String sdt;
        private String cvUrl;
        private String trangThaiHoSo;
        private String linkProfile;
        private String ghiChu;

        // số tin đã ứng tuyển (đếm Association_25)
        private Long soTinDaUngTuyen;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CandidateDetail {
        private String idUv;
        private String hoTen;
        private String email;
        private String sdt;
        private String cvUrl;
        private String trangThaiHoSo;
        private String linkProfile;
        private String ghiChu;

        private Long soTinDaUngTuyen;
        private List<JobSummary> danhSachTinDaUngTuyen; // join Association_25 + TinTuyenDung
    }
}
