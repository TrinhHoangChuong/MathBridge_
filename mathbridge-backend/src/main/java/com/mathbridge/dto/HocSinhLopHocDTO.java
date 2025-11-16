package com.mathbridge.dto;

import java.time.LocalDateTime;

public class HocSinhLopHocDTO {
    private String idHs;
    private String ho;
    private String tenDem;
    private String ten;
    private String email;
    private String sdt;
    private String trangThaiDangKy;
    private LocalDateTime ngayDangKy;

    public HocSinhLopHocDTO() {
    }

    public HocSinhLopHocDTO(String idHs, String ho, String tenDem, String ten, 
                           String email, String sdt, String trangThaiDangKy, LocalDateTime ngayDangKy) {
        this.idHs = idHs;
        this.ho = ho;
        this.tenDem = tenDem;
        this.ten = ten;
        this.email = email;
        this.sdt = sdt;
        this.trangThaiDangKy = trangThaiDangKy;
        this.ngayDangKy = ngayDangKy;
    }

    public String getIdHs() {
        return idHs;
    }

    public void setIdHs(String idHs) {
        this.idHs = idHs;
    }

    public String getHo() {
        return ho;
    }

    public void setHo(String ho) {
        this.ho = ho;
    }

    public String getTenDem() {
        return tenDem;
    }

    public void setTenDem(String tenDem) {
        this.tenDem = tenDem;
    }

    public String getTen() {
        return ten;
    }

    public void setTen(String ten) {
        this.ten = ten;
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

    public String getTrangThaiDangKy() {
        return trangThaiDangKy;
    }

    public void setTrangThaiDangKy(String trangThaiDangKy) {
        this.trangThaiDangKy = trangThaiDangKy;
    }

    public LocalDateTime getNgayDangKy() {
        return ngayDangKy;
    }

    public void setNgayDangKy(LocalDateTime ngayDangKy) {
        this.ngayDangKy = ngayDangKy;
    }

    public String getHoTen() {
        return (ho != null ? ho : "") + 
               (tenDem != null ? " " + tenDem : "") + 
               (ten != null ? " " + ten : "");
    }
}

