package com.mathbridge.dto;

import java.util.List;

public class JobDTO {
    private String id;
    private String tieuDe;
    private String viTri;
    private String moTaNgan;
    private String moTa;
    private String capBac;
    private String hinhThucLamViec;
    private String mucLuongTu;
    private String mucLuongDen;
    private List<String> yeuCau;
    private List<String> benefits;

    public JobDTO() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public List<String> getYeuCau() {
        return yeuCau;
    }

    public void setYeuCau(List<String> yeuCau) {
        this.yeuCau = yeuCau;
    }

    public List<String> getBenefits() {
        return benefits;
    }

    public void setBenefits(List<String> benefits) {
        this.benefits = benefits;
    }
}
