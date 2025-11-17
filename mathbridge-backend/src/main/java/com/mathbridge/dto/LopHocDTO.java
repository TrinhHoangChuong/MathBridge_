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
    private String idLh;
    private Integer soHocSinh;

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

    public LopHocDTO(String idLh,
                     String tenLop,
                     String loaiNgay,
                     String soBuoi,
                     String hinhThucHoc,
                     LocalDateTime ngayBatDau,
                     BigDecimal mucGiaThang,
                     String trangThai,
                     String moTa,
                     Integer soHocSinh) {
        this.idLh = idLh;
        this.tenLop = tenLop;
        this.loaiNgay = loaiNgay;
        this.soBuoi = soBuoi;
        this.hinhThucHoc = hinhThucHoc;
        this.ngayBatDau = ngayBatDau;
        this.mucGiaThang = mucGiaThang;
        this.trangThai = trangThai;
        this.moTa = moTa;
        this.soHocSinh = soHocSinh;
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

    public String getIdLh() {
        return idLh;
    }

    public void setIdLh(String idLh) {
        this.idLh = idLh;
    }

    public Integer getSoHocSinh() {
        return soHocSinh;
    }

    public void setSoHocSinh(Integer soHocSinh) {
        this.soHocSinh = soHocSinh;
    }
}
