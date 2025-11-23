package com.mathbridge.dto.PortalAdmin.Request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO cho module Tài khoản & Phân quyền (Portal Admin).
 * Gom nhiều request con để đỡ rời rạc file.
 */
public class TkPhanQuyenRequest {

    // =========================================================
    // ACCOUNTS
    // =========================================================

    /**
     * Request tìm kiếm / lọc danh sách tài khoản (bảng TaiKhoan).
     * Mapping trực tiếp với FE:
     * {
     *   searchKeyword,
     *   roleId,
     *   ownerType, // ALL | HS | NV | OTHER
     *   status,    // ALL | ACTIVE | INACTIVE | LOCKED
     *   page,
     *   size
     * }
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AccountSearchRequest {
        private String searchKeyword;
        private String roleId;
        private String ownerType;
        private String status;
        private Integer page;
        private Integer size;
    }

    /**
     * Request tạo / cập nhật tài khoản (bảng TaiKhoan + TaiKhoan_VaiTro).
     *
     * FE gửi:
     * {
     *   email,
     *   passWord,   // chỉ gửi khi tạo mới hoặc đổi mật khẩu
     *   trangThai,  // ACTIVE | INACTIVE | LOCKED
     *   roleIds: [] // list ID_Role gán cho tài khoản
     * }
     *
     * Ở màn hình này, mapping HS/NV (idHs, idNv) chỉ đọc, không chỉnh sửa.
     * Tuy nhiên vẫn để field nếu sau dùng API khác muốn set.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AccountUpsertRequest {
        private String email;          // TaiKhoan.Email
        private String passWord;       // TaiKhoan.PassWord
        private String trangThai;      // TaiKhoan.TrangThai

        // chỉ sử dụng nếu muốn điều chỉnh mapping HS / NV từ API này
        private String idHs;           // TaiKhoan.ID_HS
        private String idNv;           // TaiKhoan.ID_NV

        private List<String> roleIds;  // danh sách Role.ID_Role
    }

    // =========================================================
    // ROLES
    // =========================================================

    /**
     * Request tìm kiếm / lọc danh sách Role.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RoleSearchRequest {
        private String searchKeyword;
        private Integer page;
        private Integer size;
    }

    /**
     * Request tạo / cập nhật vai trò (bảng Role).
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RoleUpsertRequest {
        private String idRole;    // Role.ID_Role (PK)
        private String tenVaiTro; // Role.TenVaiTro
        private String ghiChu;    // Role.GhiChu
    }
}
