package com.mathbridge.dto.portaltutor;

import java.time.LocalDateTime;

/**
 * DTO cho thông tin học sinh được phân công cố vấn
 */
public class TuAssignedStudentResponseDTO {
    
    // Thông tin học sinh
    private String idHs;
    private String hoTen;
    private String email;
    private String sdt;
    private String diaChi;
    private Boolean gioiTinh;
    private Boolean trangThaiHoatDong;
    
    // Thông tin phân công
    private String idNv;
    private LocalDateTime ngayBatDau;
    private LocalDateTime ngayKetThuc;
    private String trangThai; // Dang phu trach / Tam dung / Ket thuc
    private String ghiChu;
    
    // Thông tin bổ sung
    private LocalDateTime thoiGianTao;
    private LocalDateTime thoiGianCapNhat;
    
    public TuAssignedStudentResponseDTO() {
    }
    
    // Getters and Setters
    public String getIdHs() {
        return idHs;
    }
    
    public void setIdHs(String idHs) {
        this.idHs = idHs;
    }
    
    public String getHoTen() {
        return hoTen;
    }
    
    public void setHoTen(String hoTen) {
        this.hoTen = hoTen;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getSdt() {
        return sdt;
    }
    
    public void setSdt(String sdt) {
        this.sdt = sdt;
    }
    
    public String getDiaChi() {
        return diaChi;
    }
    
    public void setDiaChi(String diaChi) {
        this.diaChi = diaChi;
    }
    
    public Boolean getGioiTinh() {
        return gioiTinh;
    }
    
    public void setGioiTinh(Boolean gioiTinh) {
        this.gioiTinh = gioiTinh;
    }
    
    public Boolean getTrangThaiHoatDong() {
        return trangThaiHoatDong;
    }
    
    public void setTrangThaiHoatDong(Boolean trangThaiHoatDong) {
        this.trangThaiHoatDong = trangThaiHoatDong;
    }
    
    public String getIdNv() {
        return idNv;
    }
    
    public void setIdNv(String idNv) {
        this.idNv = idNv;
    }
    
    public LocalDateTime getNgayBatDau() {
        return ngayBatDau;
    }
    
    public void setNgayBatDau(LocalDateTime ngayBatDau) {
        this.ngayBatDau = ngayBatDau;
    }
    
    public LocalDateTime getNgayKetThuc() {
        return ngayKetThuc;
    }
    
    public void setNgayKetThuc(LocalDateTime ngayKetThuc) {
        this.ngayKetThuc = ngayKetThuc;
    }
    
    public String getTrangThai() {
        return trangThai;
    }
    
    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }
    
    public String getGhiChu() {
        return ghiChu;
    }
    
    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }
    
    public LocalDateTime getThoiGianTao() {
        return thoiGianTao;
    }
    
    public void setThoiGianTao(LocalDateTime thoiGianTao) {
        this.thoiGianTao = thoiGianTao;
    }
    
    public LocalDateTime getThoiGianCapNhat() {
        return thoiGianCapNhat;
    }
    
    public void setThoiGianCapNhat(LocalDateTime thoiGianCapNhat) {
        this.thoiGianCapNhat = thoiGianCapNhat;
    }
}



