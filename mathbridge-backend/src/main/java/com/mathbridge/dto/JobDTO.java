package com.mathbridge.dto;

import java.time.LocalDateTime;
import java.util.List;

public class JobDTO {
    private String idTd;
    private String tieuDe;
    private String viTri;
    private String moTaNgan;
    private String moTa;
    private String yeuCau;
    private String capBac;
    private String hinhThucLamViec;
    private String mucLuongTu;
    private String mucLuongDen;
    private Integer kinhNghiem;
    private Integer soLuongTuyen;
    private LocalDateTime hanNop;
    private String trangThai;
    private List<String> yeuCauList;
    private List<String> benefits;

    public JobDTO() {
    }

    public String getIdTd() {
        return idTd;
    }

    public void setIdTd(String idTd) {
        this.idTd = idTd;
    }

    public String getTieuDe() {
        return tieuDe;
    }

    public void setTieuDe(String tieuDe) {
        this.tieuDe = tieuDe;
    }

    public String getViTri() {
        return viTri;
    }

    public void setViTri(String viTri) {
        this.viTri = viTri;
    }

    public String getMoTaNgan() {
        return moTaNgan;
    }

    public void setMoTaNgan(String moTaNgan) {
        this.moTaNgan = moTaNgan;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }

    public String getCapBac() {
        return capBac;
    }

    public void setCapBac(String capBac) {
        this.capBac = capBac;
    }

    public String getHinhThucLamViec() {
        return hinhThucLamViec;
    }

    public void setHinhThucLamViec(String hinhThucLamViec) {
        this.hinhThucLamViec = hinhThucLamViec;
    }

    public String getMucLuongTu() {
        return mucLuongTu;
    }

    public void setMucLuongTu(String mucLuongTu) {
        this.mucLuongTu = mucLuongTu;
    }

    public String getMucLuongDen() {
        return mucLuongDen;
    }

    public void setMucLuongDen(String mucLuongDen) {
        this.mucLuongDen = mucLuongDen;
    }

    public String getYeuCau() {
        return yeuCau;
    }

    public void setYeuCau(String yeuCau) {
        this.yeuCau = yeuCau;
    }

    public Integer getKinhNghiem() {
        return kinhNghiem;
    }

    public void setKinhNghiem(Integer kinhNghiem) {
        this.kinhNghiem = kinhNghiem;
    }

    public Integer getSoLuongTuyen() {
        return soLuongTuyen;
    }

    public void setSoLuongTuyen(Integer soLuongTuyen) {
        this.soLuongTuyen = soLuongTuyen;
    }

    public LocalDateTime getHanNop() {
        return hanNop;
    }

    public void setHanNop(LocalDateTime hanNop) {
        this.hanNop = hanNop;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }

    public List<String> getYeuCauList() {
        return yeuCauList;
    }

    public void setYeuCauList(List<String> yeuCauList) {
        this.yeuCauList = yeuCauList;
    }

    public List<String> getBenefits() {
        return benefits;
    }

    public void setBenefits(List<String> benefits) {
        this.benefits = benefits;
    }
}
