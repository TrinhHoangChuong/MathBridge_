package com.mathbridge.dto.PortalAdmin.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO trả về cho module Tài khoản & Phân quyền.
 */
public class TkPhanQuyenResponse {

    // =========================================================
    // ROLE DTO
    // =========================================================

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RoleDto {
        private String idRole;    // Role.ID_Role
        private String tenVaiTro; // Role.TenVaiTro
        private String ghiChu;    // Role.GhiChu
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RolePage {
        private List<RoleDto> content;
        private long totalElements;
        private int totalPages;
        private int page;
        private int size;
    }

    // =========================================================
    // ACCOUNT DTO
    // =========================================================

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AccountDto {
        private String idTk;              // TaiKhoan.ID_TK
        private String email;             // TaiKhoan.Email
        private String trangThai;         // TaiKhoan.TrangThai

        private String idHs;              // TaiKhoan.ID_HS
        private String idNv;              // TaiKhoan.ID_NV

        private LocalDateTime thoiDiemTao; // TaiKhoan.ThoiDiemTao

        private List<RoleDto> roles;      // list role mapping
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AccountPage {
        private List<AccountDto> content;
        private long totalElements;
        private int totalPages;
        private int page;
        private int size;
    }
}
