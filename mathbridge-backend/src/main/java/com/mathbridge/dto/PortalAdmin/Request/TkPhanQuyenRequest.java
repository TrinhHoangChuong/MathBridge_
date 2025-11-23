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

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AccountSearchRequest {
        private String searchKeyword; // ID_TK hoặc Email
        private String roleId;        // lọc theo ID_Role
        private String ownerType;     // ALL | HS | NV | OTHER (dựa ID_HS, ID_NV)
        private String status;        // ALL | ACTIVE | INACTIVE | LOCKED (map TrangThai)

        private Integer page;         // 0-based
        private Integer size;         // số phần tử / trang
    }

    /**
     * Request tạo / cập nhật tài khoản.
     * Map đúng bảng TaiKhoan + TaiKhoan_VaiTro.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AccountUpsertRequest {
        // ID_TK sẽ generate ở BE khi tạo mới, không bắt buộc truyền lên
        private String email;         // TaiKhoan.Email
        private String passWord;      // TaiKhoan.PassWord (BE có thể encode sau)
        private String trangThai;     // TaiKhoan.TrangThai

        // Mapping với Học sinh / Nhân viên (chỉ hiển thị, không sửa ở đây)
        private String idHs;          // TaiKhoan.ID_HS (optional)
        private String idNv;          // TaiKhoan.ID_NV (optional)

        // Danh sách role gán cho tài khoản (bảng TaiKhoan_VaiTro)
        private List<String> roleIds; // list ID_Role
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RoleSearchRequest {
        private String searchKeyword; // ID_Role hoặc TenVaiTro
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
