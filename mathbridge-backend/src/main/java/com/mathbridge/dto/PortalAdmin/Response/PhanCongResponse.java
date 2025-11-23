package com.mathbridge.dto.PortalAdmin.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class PhanCongResponse {

    // ====== PagedResult generic ======
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PagedResult<T> {
        private List<T> content;
        private long totalElements;
        private int totalPages;
        private int page;
        private int size;
    }

    // ====== Thông tin cố vấn (NhanVien) cho FE ======
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdvisorSummary {
        private String idNv;
        private String ho;
        private String tenDem;
        private String ten;
        private String email;
        private String sdt;
        private String chuyenMon;
        private Integer kinhNghiem;
        private String chucVu;
        private String idCs;                 // map ID_CS
        private Boolean trangThaiHoatDong;   // map TrangThaiHoatDong (bit)
    }

    // ====== Thông tin học sinh cho FE ======
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentSummary {
        private String idHs;
        private String ho;
        private String tenDem;
        private String ten;
        private String email;
        private String sdt;
        private Boolean gioiTinh;
        private LocalDate ngaySinh;
        private String diaChi;
        private Boolean trangThaiHoatDong;   // map TrangThaiHoatDong
    }

    // ====== Thông tin phân công CoVan_HocSinh ======
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignmentSummary {
        private String idNv;
        private String idHs;
        private LocalDateTime ngayBatDau;
        private LocalDateTime ngayKetThuc;
        private String trangThai;
        private String ghiChu;

        // thông tin học sinh join từ HocSinh
        private StudentSummary hocSinh;
    }
}
