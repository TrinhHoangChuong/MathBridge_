package com.mathbridge.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
// Hy

public class TuInvoiceDTO {
    private String idHoaDon;
    private String idHs;
    private String studentName;
    private String studentEmail;
    private String studentPhone;
    private String studentAddress;
    private String idLh;
    private String tenLop;
    private String chuongTrinh;
    private BigDecimal tongTien;
    private LocalDate ngayDangKy;
    private LocalDate ngayThanhToan;
    private LocalDate hanThanhToan;
    private String soThang;
    private String trangThai;
    private String idLs;
    private String paymentMethodName;
    private String paymentMethodType;
    private String ghiChu;

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

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public String getStudentPhone() {
        return studentPhone;
    }

    public void setStudentPhone(String studentPhone) {
        this.studentPhone = studentPhone;
    }

    public String getStudentAddress() {
        return studentAddress;
    }

    public void setStudentAddress(String studentAddress) {
        this.studentAddress = studentAddress;
    }

    public String getIdLh() {
        return idLh;
    }

    public void setIdLh(String idLh) {
        this.idLh = idLh;
    }

    public String getTenLop() {
        return tenLop;
    }

    public void setTenLop(String tenLop) {
        this.tenLop = tenLop;
    }

    public String getChuongTrinh() {
        return chuongTrinh;
    }

    public void setChuongTrinh(String chuongTrinh) {
        this.chuongTrinh = chuongTrinh;
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

    public LocalDate getNgayThanhToan() {
        return ngayThanhToan;
    }

    public void setNgayThanhToan(LocalDate ngayThanhToan) {
        this.ngayThanhToan = ngayThanhToan;
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

    public String getIdLs() {
        return idLs;
    }

    public void setIdLs(String idLs) {
        this.idLs = idLs;
    }

    public String getPaymentMethodName() {
        return paymentMethodName;
    }

    public void setPaymentMethodName(String paymentMethodName) {
        this.paymentMethodName = paymentMethodName;
    }

    public String getPaymentMethodType() {
        return paymentMethodType;
    }

    public void setPaymentMethodType(String paymentMethodType) {
        this.paymentMethodType = paymentMethodType;
    }

    public String getGhiChu() {
        return ghiChu;
    }

    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }
}

