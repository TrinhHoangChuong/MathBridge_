package com.mathbridge.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class LopHocDTO {

    private String idLop;          // ID_LH
    private String tenLop;         // TenLop
    private String chuongTrinh;    // TenCT của ChuongTrinh
    private String hinhThucHoc;    // Online / Offline
    private LocalDateTime ngayBatDau;
    private BigDecimal hocPhiThang; // MucGia_thang
    private String trangThai;      // TrangThai

    public LopHocDTO(String idLop,
                          String tenLop,
                          String chuongTrinh,
                          String hinhThucHoc,
                          LocalDateTime ngayBatDau,
                          BigDecimal hocPhiThang,
                          String trangThai) {
        this.idLop = idLop;
        this.tenLop = tenLop;
        this.chuongTrinh = chuongTrinh;
        this.hinhThucHoc = hinhThucHoc;
        this.ngayBatDau = ngayBatDau;
        this.hocPhiThang = hocPhiThang;
        this.trangThai = trangThai;
    }

    public String getIdLop() {
        return idLop;
    }

    public void setIdLop(String idLop) {
        this.idLop = idLop;
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

    public BigDecimal getHocPhiThang() {
        return hocPhiThang;
    }

    public void setHocPhiThang(BigDecimal hocPhiThang) {
        this.hocPhiThang = hocPhiThang;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }
}
