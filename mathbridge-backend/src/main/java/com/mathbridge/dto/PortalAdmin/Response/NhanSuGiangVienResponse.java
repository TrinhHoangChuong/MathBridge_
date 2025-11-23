package com.mathbridge.dto.PortalAdmin.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class NhanSuGiangVienResponse {

    // ====== STAFF INFO (LIST + DETAIL) ======

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StaffInfo {
        private String idNv;
        private String ho;
        private String tenDem;
        private String ten;

        private String email;
        private String sdt;
        private Boolean gioiTinh;

        private String idCs;
        private String campusName;

        private String chucVu;
        private String chuyenMon;
        private Integer kinhNghiem;

        private Boolean trangThaiHoatDong;

        private String idTk;
        private List<String> roleNames;

        private LocalDateTime thoiGianTao;
        private LocalDateTime thoiGianCapNhat;
    }

    // ====== DROPDOWNS ======

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CampusOption {
        private String idCs;
        private String tenCoSo;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoleOption {
        private String idRole;
        private String tenVaiTro;
    }

    /**
     * Tài khoản khả dụng để gán cho nhân sự mới.
     * Dùng cho GET /accounts/available.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AccountOption {
        private String idTk;
        private String email;
        private List<String> roleNames;

        /**
         * HS / NV / OTHER
         * Suy ra từ TaiKhoan.ID_HS / TaiKhoan.ID_NV.
         */
        private String ownerType;

        // Có thể hiển thị thêm nếu cần
        private String idNv;
        private String idHs;
    }

    // ====== CONTRACT INFO ======

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContractInfo {
        private String idHd;
        private String idNv;
        private String staffName;

        private String loaiHopDong;
        private String hinhThucDay;
        private String phamViCongViec;

        private LocalDate ngayKy;
        private LocalDate ngayHieuLuc;
        private LocalDate ngayKetThuc;

        private Boolean chamDutHD;
        private LocalDate ngayChamDutHD;
    }
}
