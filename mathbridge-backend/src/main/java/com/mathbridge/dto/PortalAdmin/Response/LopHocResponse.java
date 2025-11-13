// com/mathbridge/dto/admin/LopHocResponse.java
package com.mathbridge.dto.PortalAdmin.Response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class LopHocResponse {
    private String idLh, idNv, idCt, tenLop, loaiNgay, soBuoi, hinhThucHoc, danhGia, trangThai, moTa;
    private LocalDateTime ngayBatDau;
    private BigDecimal mucGiaThang;
    private String tenChuongTrinh, tenNhanVien;
    public LopHocResponse() {}
    public LopHocResponse(String idLh, String idNv, String idCt, String tenLop, String loaiNgay,
                          String soBuoi, String hinhThucHoc, LocalDateTime ngayBatDau, BigDecimal mucGiaThang,
                          String danhGia, String trangThai, String moTa, String tenChuongTrinh, String tenNhanVien){
        this.idLh=idLh; this.idNv=idNv; this.idCt=idCt; this.tenLop=tenLop; this.loaiNgay=loaiNgay;
        this.soBuoi=soBuoi; this.hinhThucHoc=hinhThucHoc; this.ngayBatDau=ngayBatDau; this.mucGiaThang=mucGiaThang;
        this.danhGia=danhGia; this.trangThai=trangThai; this.moTa=moTa; this.tenChuongTrinh=tenChuongTrinh; this.tenNhanVien=tenNhanVien;
    }

    public String getIdLh() {
        return idLh;
    }

    public void setIdLh(String idLh) {
        this.idLh = idLh;
    }

    public String getIdNv() {
        return idNv;
    }

    public void setIdNv(String idNv) {
        this.idNv = idNv;
    }

    public String getIdCt() {
        return idCt;
    }

    public void setIdCt(String idCt) {
        this.idCt = idCt;
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

    public String getDanhGia() {
        return danhGia;
    }

    public void setDanhGia(String danhGia) {
        this.danhGia = danhGia;
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

    public String getTenChuongTrinh() {
        return tenChuongTrinh;
    }

    public void setTenChuongTrinh(String tenChuongTrinh) {
        this.tenChuongTrinh = tenChuongTrinh;
    }

    public String getTenNhanVien() {
        return tenNhanVien;
    }

    public void setTenNhanVien(String tenNhanVien) {
        this.tenNhanVien = tenNhanVien;
    }
}
