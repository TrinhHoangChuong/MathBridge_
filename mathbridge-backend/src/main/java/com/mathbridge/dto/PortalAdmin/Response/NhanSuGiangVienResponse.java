package com.mathbridge.dto.PortalAdmin.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO trả về cho thông tin Nhân sự (Nhân viên, Giảng viên).
 */
@Data
@Builder
public class NhanSuGiangVienResponse {

    private String idNv;
    private String ho;
    private String tenDem;
    private String ten;
    private String fullName;

    private String email;
    private String sdt;
    private Boolean gioiTinh;

    private String idCs;
    private String campusName;

    private String chucVu;
    private String chuyenMon;
    private Integer kinhNghiem;

    private Boolean trangThaiHoatDong;

    private String idTk;                // ID_TK từ bảng TaiKhoan
    private List<String> roleNames;     // Danh sách tên vai trò (TenVaiTro)

    private LocalDateTime thoiGianTao;
    private LocalDateTime thoiGianCapNhat;

    // ===== DROPDOWN DTOs =====
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
    // ========== DTO HỢP ĐỒNG ==========

    @Data
    @Builder
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
