package com.mathbridge.dto;

import java.math.BigDecimal;

public class DiemSoDTO {
    private String idHs;
    private String hoTen;
    private String email;
    private BigDecimal diem15Phut;
    private BigDecimal diem45Phut;
    private BigDecimal diemThiHK;
    private BigDecimal diemTrungBinh;
    private String xepLoai;
    private Integer soBaiTap;
    private Integer soBaiDaNop;

    public DiemSoDTO() {
    }

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

    public BigDecimal getDiem15Phut() {
        return diem15Phut;
    }

    public void setDiem15Phut(BigDecimal diem15Phut) {
        this.diem15Phut = diem15Phut;
    }

    public BigDecimal getDiem45Phut() {
        return diem45Phut;
    }

    public void setDiem45Phut(BigDecimal diem45Phut) {
        this.diem45Phut = diem45Phut;
    }

    public BigDecimal getDiemThiHK() {
        return diemThiHK;
    }

    public void setDiemThiHK(BigDecimal diemThiHK) {
        this.diemThiHK = diemThiHK;
    }

    public BigDecimal getDiemTrungBinh() {
        return diemTrungBinh;
    }

    public void setDiemTrungBinh(BigDecimal diemTrungBinh) {
        this.diemTrungBinh = diemTrungBinh;
    }

    public String getXepLoai() {
        return xepLoai;
    }

    public void setXepLoai(String xepLoai) {
        this.xepLoai = xepLoai;
    }

    public Integer getSoBaiTap() {
        return soBaiTap;
    }

    public void setSoBaiTap(Integer soBaiTap) {
        this.soBaiTap = soBaiTap;
    }

    public Integer getSoBaiDaNop() {
        return soBaiDaNop;
    }

    public void setSoBaiDaNop(Integer soBaiDaNop) {
        this.soBaiDaNop = soBaiDaNop;
    }
}

