package com.mathbridge.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class LopHocDTO {

    private String tenLop;
    private String loaiNgay;
    private String soBuoi;
    private String hinhThucHoc;
    private LocalDateTime ngayBatDau;
    private BigDecimal mucGiaThang;
    private String trangThai;
    private String moTa;

    public LopHocDTO() {
    }

    public LopHocDTO(String tenLop,
                     String loaiNgay,
                     String soBuoi,
                     String hinhThucHoc,
                     LocalDateTime ngayBatDau,
                     BigDecimal mucGiaThang,
                     String trangThai,
                     String moTa) {
        this.tenLop = tenLop;
        this.loaiNgay = loaiNgay;
        this.soBuoi = soBuoi;
        this.hinhThucHoc = hinhThucHoc;
        this.ngayBatDau = ngayBatDau;
        this.mucGiaThang = mucGiaThang;
        this.trangThai = trangThai;
        this.moTa = moTa;
    }

    public String getTenLop() {
        return tenLop;
    }

    public void setTenLop(String tenLop) {
        this.tenLop = tenLop;
    }

    public String getLoaiNgay() {
        return loaiNgay;
    }

    public void setLoaiNgay(String loaiNgay) {
        this.loaiNgay = loaiNgay;
    }

    public String getSoBuoi() {
        return soBuoi;
    }

    public void setSoBuoi(String soBuoi) {
        this.soBuoi = soBuoi;
    }

    public String getHinhThucHoc() {
        return hinhThucHoc;
    }

    public void setHinhThucHoc(String hinhThucHoc) {
        this.hinhThucHoc = hinhThucHoc;
    }

    public LocalDateTime getNgayBatDau() {
        return ngayBatDau;
    }

    public void setNgayBatDau(LocalDateTime ngayBatDau) {
        this.ngayBatDau = ngayBatDau;
    }

    public BigDecimal getMucGiaThang() {
        return mucGiaThang;
    }

    public void setMucGiaThang(BigDecimal mucGiaThang) {
        this.mucGiaThang = mucGiaThang;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }
}
