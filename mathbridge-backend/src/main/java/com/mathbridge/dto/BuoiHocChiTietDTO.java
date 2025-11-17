package com.mathbridge.dto;

import java.time.LocalDateTime;

public class BuoiHocChiTietDTO {
    private String idBh;
    private String idLh;
    private String tenLop;
    private String tenCaHoc;
    private String thuTuBuoiHoc;
    private LocalDateTime ngayHoc;
    private LocalDateTime gioBatDau;
    private LocalDateTime gioKetThuc;
    private String noiDung;
    private String ghiChu;
    private String tenPhong;
    private Integer soHocSinh;
    private Integer soHocSinhCoMat;

    public BuoiHocChiTietDTO() {
    }

    public String getIdBh() {
        return idBh;
    }

    public void setIdBh(String idBh) {
        this.idBh = idBh;
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

    public String getTenCaHoc() {
        return tenCaHoc;
    }

    public void setTenCaHoc(String tenCaHoc) {
        this.tenCaHoc = tenCaHoc;
    }

    public String getThuTuBuoiHoc() {
        return thuTuBuoiHoc;
    }

    public void setThuTuBuoiHoc(String thuTuBuoiHoc) {
        this.thuTuBuoiHoc = thuTuBuoiHoc;
    }

    public LocalDateTime getNgayHoc() {
        return ngayHoc;
    }

    public void setNgayHoc(LocalDateTime ngayHoc) {
        this.ngayHoc = ngayHoc;
    }

    public LocalDateTime getGioBatDau() {
        return gioBatDau;
    }

    public void setGioBatDau(LocalDateTime gioBatDau) {
        this.gioBatDau = gioBatDau;
    }

    public LocalDateTime getGioKetThuc() {
        return gioKetThuc;
    }

    public void setGioKetThuc(LocalDateTime gioKetThuc) {
        this.gioKetThuc = gioKetThuc;
    }

    public String getNoiDung() {
        return noiDung;
    }

    public void setNoiDung(String noiDung) {
        this.noiDung = noiDung;
    }

    public String getGhiChu() {
        return ghiChu;
    }

    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }

    public String getTenPhong() {
        return tenPhong;
    }

    public void setTenPhong(String tenPhong) {
        this.tenPhong = tenPhong;
    }

    public Integer getSoHocSinh() {
        return soHocSinh;
    }

    public void setSoHocSinh(Integer soHocSinh) {
        this.soHocSinh = soHocSinh;
    }

    public Integer getSoHocSinhCoMat() {
        return soHocSinhCoMat;
    }

    public void setSoHocSinhCoMat(Integer soHocSinhCoMat) {
        this.soHocSinhCoMat = soHocSinhCoMat;
    }
}

