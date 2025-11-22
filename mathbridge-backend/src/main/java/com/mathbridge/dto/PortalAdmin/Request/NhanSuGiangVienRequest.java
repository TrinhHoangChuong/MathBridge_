package com.mathbridge.dto.PortalAdmin.Request;

import lombok.Data;

import java.time.LocalDate;

/**
 * DTO filter dùng cho API search danh sách nhân sự.
 * FE: POST /api/portal/admin/nhansu/staff/search
 */
@Data
public class NhanSuGiangVienRequest {

    /**
     * Từ khóa chung: tìm theo Họ tên, Email, SĐT...
     */
    private String searchKeyword;

    /**
     * Lọc theo cơ sở (ID_CS từ bảng CoSo), có thể null.
     */
    private String campusId;

    /**
     * Lọc theo vai trò (ID_Role từ bảng Role), có thể null.
     */
    private String roleId;

    /**
     * Trạng thái nhân sự:
     *  - "active"   -> TrangThaiHoatDong = 1
     *  - "inactive" -> TrangThaiHoatDong = 0
     *  - null / ""  -> tất cả
     */
    private String status;

    /**
     * Phân trang (page 0-based) – FE đang gửi, nhưng hiện tại BE có thể dùng hoặc không.
     */
    private Integer page;

    /**
     * Kích thước trang (mặc định 10).
     */
    private Integer size;

    // ========= INNER DTO dùng cho các API khác trong cùng module =========

    /**
     * DTO dùng cho tạo / cập nhật nhân sự.
     * FE: POST /staff, PUT /staff/{idNv}
     */
    @Data
    public static class StaffUpsert {
        private String idNv;                 // có thể null khi tạo mới
        private String ho;
        private String tenDem;
        private String ten;
        private String email;
        private String sdt;
        /**
         * true = Nam, false = Nữ, null = không khai báo
         */
        private Boolean gioiTinh;
        /**
         * ID_CS từ bảng CoSo
         */
        private String idCs;
        private String chucVu;
        private String chuyenMon;
        private Integer kinhNghiem;
        /**
         * Trạng thái hoạt động của nhân sự
         */
        private Boolean trangThaiHoatDong;

        /**
         * ID_Role từ bảng Role để gán vào TaiKhoan_VaiTro.
         * Nếu null thì không gán role mặc định.
         */
        private String roleId;
    }

    /**
     * DTO dùng cho search danh sách hợp đồng.
     * FE: POST /contracts/search
     */
    @Data
    public static class ContractSearch {
        private String searchKeyword;  // Mã HĐ hoặc tên nhân viên
        private String staffId;        // ID_NV
        private String contractType;   // LoaiHopDong
        /**
         * "active" | "expired" | "terminated" | null
         */
        private String status;
        private Integer page;
        private Integer size;
    }

    /**
     * DTO dùng cho tạo / cập nhật hợp đồng.
     * FE: POST /contracts, PUT /contracts/{idHd}
     */
    @Data
    public static class ContractUpsert {
        private String idHd;               // có thể null khi tạo mới
        private String idNv;               // ID_NV nhân viên
        private String loaiHopDong;
        private LocalDate ngayKy;
        private LocalDate ngayHieuLuc;
        private LocalDate ngayKetThuc;
        private String phamViCongViec;
        private String hinhThucDay;
        private Boolean chamDutHD;
        private LocalDate ngayChamDutHD;
    }
}
