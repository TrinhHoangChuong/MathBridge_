package com.mathbridge.dto.PortalAdmin.Request;

import lombok.Data;

import java.time.LocalDate;

@Data
public class NhanSuGiangVienRequest {

    // ====== SEARCH STAFF (POST /staff/search) ======

    private String searchKeyword;
    private String campusId;
    private String roleId;
    private String status;
    private Integer page;
    private Integer size;

    // ====== UP-SERT STAFF (POST/PUT /staff) ======

    @Data
    public static class StaffUpsert {

        /**
         * ID_NV:
         *  - null khi tạo mới
         *  - có giá trị khi update
         */
        private String idNv;

        /**
         * ID_TK của tài khoản đã chọn (dropdown):
         *  - BẮT BUỘC khi tạo mới nhân sự (create)
         *  - BE bỏ qua khi update (không đổi tài khoản ở đây).
         */
        private String idTk;

        private String ho;
        private String tenDem;
        private String ten;

        /**
         * Email hiển thị trên form (readonly).
         * FE vẫn gửi lên, nhưng BE luôn sync = TaiKhoan.Email.
         */
        private String email;

        private String sdt;

        /**
         * true  -> Nam
         * false -> Nữ
         */
        private Boolean gioiTinh;

        /**
         * Cơ sở làm việc (ID_CS).
         */
        private String idCs;

        private String chucVu;
        private String chuyenMon;
        private Integer kinhNghiem;

        /**
         * Trạng thái làm việc (NhanVien.TrangThaiHoatDong).
         */
        private Boolean trangThaiHoatDong;

        /**
         * FE hiện tại chưa gửi, nhưng nếu sau này cần lọc tài khoản theo role
         * thì có thể dùng thêm field này.
         */
        private String roleId;
    }

    // ====== SEARCH CONTRACTS (POST /contracts/search) ======

    @Data
    public static class ContractSearch {
        private String searchKeyword;
        private String staffId;      // ID_NV
        private String contractType; // LoaiHopDong
        private String status;       // active | expired | terminated
        private Integer page;
        private Integer size;
    }

    // ====== UP-SERT CONTRACT (POST/PUT /contracts) ======

    @Data
    public static class ContractUpsert {
        private String idHd;
        private String idNv;
        private String loaiHopDong;
        private String hinhThucDay;
        private LocalDate ngayKy;
        private LocalDate ngayHieuLuc;
        private LocalDate ngayKetThuc;
        private String phamViCongViec;
        private Boolean chamDutHD;
        private LocalDate ngayChamDutHD;
    }
}
