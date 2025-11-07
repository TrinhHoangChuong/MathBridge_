package com.mathbridge.dto.PortalAdmin.Response;

import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class DashboardResponse {

    // ========= KPI 1-4 =========
    private long lopDangMo;             // (1)
    private long hocSinhActive;         // (2)
    private long nhanVienActive;        // (3)
    private BigDecimal tongDoanhThuDaThu; // (4)

    // ========= KPI 5 =========
    private long hoaDonDaThanhToan;
    private long hoaDonChuaThanhToan;

    // ========= KPI 6 =========
    private List<InvoiceUnpaidSoonDto> hoaDonChuaThanhToanSapDenHan;

    // ========= KPI 7 =========
    private BigDecimal doanhThuPT001 = BigDecimal.ZERO;
    private BigDecimal doanhThuPT002 = BigDecimal.ZERO;
    private BigDecimal doanhThuPT003 = BigDecimal.ZERO;
    private BigDecimal doanhThuPT004 = BigDecimal.ZERO;
    private BigDecimal doanhThuPT005 = BigDecimal.ZERO;

    // ========= KPI 8 =========
    private List<TopClassByStudentDto> topLopTheoSiSo;

    // ========= KPI 9 =========
    private List<ClassPerProgramDto> lopTheoChuongTrinh;

    // ========= KPI 10 =========
    private List<RecruitmentSummaryDto> tuyenDung;

    // ========= KPI 11 =========
    private long supportOpen;
    private long supportClosed;
    private long supportProcessing;

    // ========= KPI 12 =========
    private long contractActive;
    private long contractExpired;

    // ========= KPI 13 =========
    private List<ContractPerTeacherDto> hopDongTheoNhanVien;

    // ========== GET/SET ==========

    public long getLopDangMo() {
        return lopDangMo;
    }

    public void setLopDangMo(long lopDangMo) {
        this.lopDangMo = lopDangMo;
    }

    public long getHocSinhActive() {
        return hocSinhActive;
    }

    public void setHocSinhActive(long hocSinhActive) {
        this.hocSinhActive = hocSinhActive;
    }

    public long getNhanVienActive() {
        return nhanVienActive;
    }

    public void setNhanVienActive(long nhanVienActive) {
        this.nhanVienActive = nhanVienActive;
    }

    public BigDecimal getTongDoanhThuDaThu() {
        return tongDoanhThuDaThu;
    }

    public void setTongDoanhThuDaThu(BigDecimal tongDoanhThuDaThu) {
        this.tongDoanhThuDaThu = tongDoanhThuDaThu;
    }

    public long getHoaDonDaThanhToan() {
        return hoaDonDaThanhToan;
    }

    public void setHoaDonDaThanhToan(long hoaDonDaThanhToan) {
        this.hoaDonDaThanhToan = hoaDonDaThanhToan;
    }

    public long getHoaDonChuaThanhToan() {
        return hoaDonChuaThanhToan;
    }

    public void setHoaDonChuaThanhToan(long hoaDonChuaThanhToan) {
        this.hoaDonChuaThanhToan = hoaDonChuaThanhToan;
    }

    public List<InvoiceUnpaidSoonDto> getHoaDonChuaThanhToanSapDenHan() {
        return hoaDonChuaThanhToanSapDenHan;
    }

    public void setHoaDonChuaThanhToanSapDenHan(List<InvoiceUnpaidSoonDto> hoaDonChuaThanhToanSapDenHan) {
        this.hoaDonChuaThanhToanSapDenHan = hoaDonChuaThanhToanSapDenHan;
    }

    public BigDecimal getDoanhThuPT001() {
        return doanhThuPT001;
    }

    public void setDoanhThuPT001(BigDecimal doanhThuPT001) {
        this.doanhThuPT001 = doanhThuPT001;
    }

    public BigDecimal getDoanhThuPT002() {
        return doanhThuPT002;
    }

    public void setDoanhThuPT002(BigDecimal doanhThuPT002) {
        this.doanhThuPT002 = doanhThuPT002;
    }

    public BigDecimal getDoanhThuPT003() {
        return doanhThuPT003;
    }

    public void setDoanhThuPT003(BigDecimal doanhThuPT003) {
        this.doanhThuPT003 = doanhThuPT003;
    }

    public BigDecimal getDoanhThuPT004() {
        return doanhThuPT004;
    }

    public void setDoanhThuPT004(BigDecimal doanhThuPT004) {
        this.doanhThuPT004 = doanhThuPT004;
    }

    public BigDecimal getDoanhThuPT005() {
        return doanhThuPT005;
    }

    public void setDoanhThuPT005(BigDecimal doanhThuPT005) {
        this.doanhThuPT005 = doanhThuPT005;
    }

    public List<TopClassByStudentDto> getTopLopTheoSiSo() {
        return topLopTheoSiSo;
    }

    public void setTopLopTheoSiSo(List<TopClassByStudentDto> topLopTheoSiSo) {
        this.topLopTheoSiSo = topLopTheoSiSo;
    }

    public List<ClassPerProgramDto> getLopTheoChuongTrinh() {
        return lopTheoChuongTrinh;
    }

    public void setLopTheoChuongTrinh(List<ClassPerProgramDto> lopTheoChuongTrinh) {
        this.lopTheoChuongTrinh = lopTheoChuongTrinh;
    }

    public List<RecruitmentSummaryDto> getTuyenDung() {
        return tuyenDung;
    }

    public void setTuyenDung(List<RecruitmentSummaryDto> tuyenDung) {
        this.tuyenDung = tuyenDung;
    }

    public long getSupportOpen() {
        return supportOpen;
    }

    public void setSupportOpen(long supportOpen) {
        this.supportOpen = supportOpen;
    }

    public long getSupportClosed() {
        return supportClosed;
    }

    public void setSupportClosed(long supportClosed) {
        this.supportClosed = supportClosed;
    }

    public long getSupportProcessing() {
        return supportProcessing;
    }

    public void setSupportProcessing(long supportProcessing) {
        this.supportProcessing = supportProcessing;
    }

    public long getContractActive() {
        return contractActive;
    }

    public void setContractActive(long contractActive) {
        this.contractActive = contractActive;
    }

    public long getContractExpired() {
        return contractExpired;
    }

    public void setContractExpired(long contractExpired) {
        this.contractExpired = contractExpired;
    }

    public List<ContractPerTeacherDto> getHopDongTheoNhanVien() {
        return hopDongTheoNhanVien;
    }

    public void setHopDongTheoNhanVien(List<ContractPerTeacherDto> hopDongTheoNhanVien) {
        this.hopDongTheoNhanVien = hopDongTheoNhanVien;
    }

    // ========== NESTED DTO ==========

    @Getter
    public static class InvoiceUnpaidSoonDto {
        private String idHoaDon;
        private String idHocSinh;
        private String idLopHoc;
        private LocalDate ngayDangKy;
        private LocalDate hanThanhToan;
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
