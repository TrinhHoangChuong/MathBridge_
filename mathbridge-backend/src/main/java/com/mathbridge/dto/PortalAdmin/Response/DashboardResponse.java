package com.mathbridge.dto.PortalAdmin.Response;

import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
public class DashboardResponse {

    // ========= KPI 1-4 =========
    // (1) Lớp đang mở
    private long lopDangMo;
    // (2) Học sinh active
    private long hocSinhActive;
    // (3) Nhân viên active
    private long nhanVienActive;
    // (4) Tổng doanh thu đã thu
    private BigDecimal tongDoanhThuDaThu;

    // ========= KPI 5: Hóa đơn theo trạng thái =========
    private long hoaDonDaThanhToan;
    private long hoaDonChuaThanhToan;

    // ========= KPI 6: Hóa đơn chưa thanh toán sắp đến hạn =========
    private List<InvoiceUnpaidSoonDto> hoaDonChuaThanhToanSapDenHan;

    // ========= KPI 7: Doanh thu theo phương thức thanh toán =========
    private BigDecimal doanhThuPT001;
    private BigDecimal doanhThuPT002;
    private BigDecimal doanhThuPT003;
    private BigDecimal doanhThuPT004;
    private BigDecimal doanhThuPT005;

    // ========= KPI 8: Top lớp theo sĩ số =========
    private List<TopClassByStudentDto> topLopTheoSiSo;

    // ========= KPI 9: Lớp theo chương trình =========
    private List<ClassPerProgramDto> lopTheoChuongTrinh;

    // ========= KPI 10: Tuyển dụng =========
    private List<RecruitmentSummaryDto> tuyenDung;

    // ========= KPI 11: Yêu cầu hỗ trợ =========
    private long supportOpen;
    private long supportProcessing;
    private long supportClosed;

    // ========= KPI 12: Hợp đồng theo trạng thái =========
    private long contractActive;
    private long contractExpired;

    // ========= KPI 13: Hợp đồng / Nhân viên =========
    private List<ContractPerTeacherDto> hopDongTheoNhanVien;

    // ======= SETTERS (để Service set dữ liệu) =======

    public void setLopDangMo(long lopDangMo) {
        this.lopDangMo = lopDangMo;
    }

    public void setHocSinhActive(long hocSinhActive) {
        this.hocSinhActive = hocSinhActive;
    }

    public void setNhanVienActive(long nhanVienActive) {
        this.nhanVienActive = nhanVienActive;
    }

    public void setTongDoanhThuDaThu(BigDecimal tongDoanhThuDaThu) {
        this.tongDoanhThuDaThu = tongDoanhThuDaThu;
    }

    public void setHoaDonDaThanhToan(long hoaDonDaThanhToan) {
        this.hoaDonDaThanhToan = hoaDonDaThanhToan;
    }

    public void setHoaDonChuaThanhToan(long hoaDonChuaThanhToan) {
        this.hoaDonChuaThanhToan = hoaDonChuaThanhToan;
    }

    public void setHoaDonChuaThanhToanSapDenHan(List<InvoiceUnpaidSoonDto> hoaDonChuaThanhToanSapDenHan) {
        this.hoaDonChuaThanhToanSapDenHan = hoaDonChuaThanhToanSapDenHan;
    }

    public void setDoanhThuPT001(BigDecimal doanhThuPT001) {
        this.doanhThuPT001 = doanhThuPT001;
    }

    public void setDoanhThuPT002(BigDecimal doanhThuPT002) {
        this.doanhThuPT002 = doanhThuPT002;
    }

    public void setDoanhThuPT003(BigDecimal doanhThuPT003) {
        this.doanhThuPT003 = doanhThuPT003;
    }

    public void setDoanhThuPT004(BigDecimal doanhThuPT004) {
        this.doanhThuPT004 = doanhThuPT004;
    }

    public void setDoanhThuPT005(BigDecimal doanhThuPT005) {
        this.doanhThuPT005 = doanhThuPT005;
    }

    public void setTopLopTheoSiSo(List<TopClassByStudentDto> topLopTheoSiSo) {
        this.topLopTheoSiSo = topLopTheoSiSo;
    }

    public void setLopTheoChuongTrinh(List<ClassPerProgramDto> lopTheoChuongTrinh) {
        this.lopTheoChuongTrinh = lopTheoChuongTrinh;
    }

    public void setTuyenDung(List<RecruitmentSummaryDto> tuyenDung) {
        this.tuyenDung = tuyenDung;
    }

    public void setSupportOpen(long supportOpen) {
        this.supportOpen = supportOpen;
    }

    public void setSupportProcessing(long supportProcessing) {
        this.supportProcessing = supportProcessing;
    }

    public void setSupportClosed(long supportClosed) {
        this.supportClosed = supportClosed;
    }

    public void setContractActive(long contractActive) {
        this.contractActive = contractActive;
    }

    public void setContractExpired(long contractExpired) {
        this.contractExpired = contractExpired;
    }

    public void setHopDongTheoNhanVien(List<ContractPerTeacherDto> hopDongTheoNhanVien) {
        this.hopDongTheoNhanVien = hopDongTheoNhanVien;
    }

    // ========= NESTED DTOs cho phần list =========

    @Getter
    public static class InvoiceUnpaidSoonDto {
        // Mã HĐ
        private String idHoaDon;
        // Mã HS
        private String idHocSinh;
        // Mã lớp
        private String idLopHoc;
        // Ngày đăng ký
        private LocalDate ngayDangKy;
        // Hạn thanh toán
        private LocalDate hanThanhToan;
        // Số tiền
        private BigDecimal soTien;

        public void setIdHoaDon(String idHoaDon) {
            this.idHoaDon = idHoaDon;
        }

        public void setIdHocSinh(String idHocSinh) {
            this.idHocSinh = idHocSinh;
        }

        public void setIdLopHoc(String idLopHoc) {
            this.idLopHoc = idLopHoc;
        }

        public void setNgayDangKy(LocalDate ngayDangKy) {
            this.ngayDangKy = ngayDangKy;
        }

        public void setHanThanhToan(LocalDate hanThanhToan) {
            this.hanThanhToan = hanThanhToan;
        }

        public void setSoTien(BigDecimal soTien) {
            this.soTien = soTien;
        }
    }

    @Getter
    public static class TopClassByStudentDto {
        private String idLopHoc;
        private String tenLop;
        private long soHocSinh;

        public void setIdLopHoc(String idLopHoc) {
            this.idLopHoc = idLopHoc;
        }

        public void setTenLop(String tenLop) {
            this.tenLop = tenLop;
        }

        public void setSoHocSinh(long soHocSinh) {
            this.soHocSinh = soHocSinh;
        }
    }

    @Getter
    public static class ClassPerProgramDto {
        private String idChuongTrinh;
        private String tenChuongTrinh;
        private long soLop;

        public void setIdChuongTrinh(String idChuongTrinh) {
            this.idChuongTrinh = idChuongTrinh;
        }

        public void setTenChuongTrinh(String tenChuongTrinh) {
            this.tenChuongTrinh = tenChuongTrinh;
        }

        public void setSoLop(long soLop) {
            this.soLop = soLop;
        }
    }

    @Getter
    public static class RecruitmentSummaryDto {
        private String idTin;
        private String tieuDe;
        private String trangThai;
        private long soUngVien;

        public void setIdTin(String idTin) {
            this.idTin = idTin;
        }

        public void setTieuDe(String tieuDe) {
            this.tieuDe = tieuDe;
        }

        public void setTrangThai(String trangThai) {
            this.trangThai = trangThai;
        }

        public void setSoUngVien(long soUngVien) {
            this.soUngVien = soUngVien;
        }
    }

    @Getter
    public static class ContractPerTeacherDto {
        private String idNhanVien;
        private long soHopDong;

        public void setIdNhanVien(String idNhanVien) {
            this.idNhanVien = idNhanVien;
        }

        public void setSoHopDong(long soHopDong) {
            this.soHopDong = soHopDong;
        }
    }
}
