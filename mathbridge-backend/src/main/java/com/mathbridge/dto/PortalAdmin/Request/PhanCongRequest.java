package com.mathbridge.dto.PortalAdmin.Request;

import lombok.Data;

import java.time.LocalDateTime;

public class PhanCongRequest {

    // ========== 1. Tìm kiếm cố vấn (NhanVien) ==========
    @Data
    public static class AdvisorSearchRequest {
        /**
         * Tìm theo tên / email / SĐT
         */
        private String searchKeyword;

        /**
         * Lọc theo chức vụ (ChucVu), chuỗi đúng như trong DB.
         * "" hoặc null => không lọc.
         */
        private String chucVu;

        /**
         * "active"  => TrangThaiHoatDong = true
         * "inactive"=> TrangThaiHoatDong = false
         * "" / null => không lọc
         */
        private String trangThaiHoatDong;

        /**
         * Trang hiện tại (0-based). Mặc định 0 nếu null.
         */
        private Integer page;

        /**
         * Kích thước trang. Mặc định 50 nếu null.
         */
        private Integer size;
    }

    // ========== 2. Tìm học sinh khả dụng cho 1 cố vấn ==========
    @Data
    public static class StudentSearchRequest {
        /**
         * Tìm theo tên / email / SĐT
         */
        private String searchKeyword;

        /**
         * "active" / "inactive" / "" giống AdvisorSearchRequest.
         * Map với cột TrangThaiHoatDong (bit) trong bảng HocSinh.
         */
        private String trangThaiHoatDong;

        /**
         * true => chỉ lấy học sinh chưa có bất kỳ phân công đang hiệu lực
         * trong bảng CoVan_HocSinh (NgayKetThuc IS NULL).
         */
        private Boolean onlyWithoutAdvisor;

        private Integer page;
        private Integer size;
    }

    // ========== 3. Tìm danh sách phân công (CoVan_HocSinh) của 1 cố vấn ==========
    @Data
    public static class AssignmentSearchRequest {
        /**
         * "active" => NgayKetThuc IS NULL
         * "ended"  => NgayKetThuc IS NOT NULL
         * "" / null => không lọc.
         */
        private String status;

        private Integer page;
        private Integer size;
    }

    // ========== 4. Tạo phân công mới ==========
    @Data
    public static class CreateAssignmentRequest {
        private String idNv;              // map ID_NV
        private String idHs;              // map ID_HS
        private LocalDateTime ngayBatDau; // map NgayBatDau
        private LocalDateTime ngayKetThuc;// map NgayKetThuc (nullable)
        private String trangThai;         // map TrangThai
        private String ghiChu;            // map GhiChu
    }

    // ========== 5. Cập nhật phân công ==========
    @Data
    public static class UpdateAssignmentRequest {

        @Data
        public static class OriginalKey {
            private String idNv;
            private String idHs;
            private LocalDateTime ngayBatDau;
        }

        @Data
        public static class UpdateData {
            private LocalDateTime ngayBatDau;  // có thể đổi NgayBatDau (PK) – sẽ xóa + tạo mới
            private LocalDateTime ngayKetThuc;
            private String trangThai;
            private String ghiChu;
        }

        private OriginalKey originalKey;
        private UpdateData update;
    }

    // ========== 6. Kết thúc phân công ==========
    @Data
    public static class EndAssignmentRequest {
        private String idNv;
        private String idHs;
        private LocalDateTime ngayBatDau; // khóa hiện tại
        private LocalDateTime ngayKetThuc;
        private String trangThai;         // ví dụ: "Đã kết thúc"
    }
}
