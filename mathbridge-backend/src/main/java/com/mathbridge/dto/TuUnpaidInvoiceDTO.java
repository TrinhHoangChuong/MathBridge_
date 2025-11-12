package com.mathbridge.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TuUnpaidInvoiceDTO {
    private String idHoaDon;
    private String idHs;
    private String studentName;
    private String tenLop;
    private BigDecimal tongTien;
    private LocalDate ngayDangKy;
    private LocalDate hanThanhToan;
    private String soThang;
    private String trangThai;

    // Getters and Setters
    public String getIdHoaDon() {
        return idHoaDon;
    }

    public void setIdHoaDon(String idHoaDon) {
        this.idHoaDon = idHoaDon;
    }

    public String getIdHs() {
        return idHs;
    }

    public void setIdHs(String idHs) {
        this.idHs = idHs;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getTenLop() {
        return tenLop;
    }

    public void setTenLop(String tenLop) {
        this.tenLop = tenLop;
    }

    public BigDecimal getTongTien() {
        return tongTien;
    }

    public void setTongTien(BigDecimal tongTien) {
        this.tongTien = tongTien;
    }

    public LocalDate getNgayDangKy() {
        return ngayDangKy;
    }

    public void setNgayDangKy(LocalDate ngayDangKy) {
        this.ngayDangKy = ngayDangKy;
    }

    public LocalDate getHanThanhToan() {
        return hanThanhToan;
    }

    public void setHanThanhToan(LocalDate hanThanhToan) {
        this.hanThanhToan = hanThanhToan;
    }

    public String getSoThang() {
        return soThang;
    }

    public void setSoThang(String soThang) {
        this.soThang = soThang;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }
}

