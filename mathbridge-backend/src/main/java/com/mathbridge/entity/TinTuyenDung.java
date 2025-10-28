package com.mathbridge.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "TinTuyenDung")
public class TinTuyenDung {

    @Id
    @Column(name = "ID_TD", length = 10, nullable = false)
    private String idTd;

    @Column(name = "TieuDe", length = 100, nullable = false)
    private String tieuDe;

    @Column(name = "ViTri", length = 100, nullable = false)
    private String viTri;

    @Column(name = "MoTaNgan", length = 255)
    private String moTaNgan;

    @Column(name = "MoTa", length = 200, nullable = false)
    private String moTa;

    @Column(name = "YeuCau", length = 255, nullable = false)
    private String yeuCau;

    @Column(name = "CapBac", length = 100)
    private String capBac;

    @Column(name = "HinhThucLamViec", length = 100)
    private String hinhThucLamViec;

    @Column(name = "MucLuongTu", length = 255)
    private String mucLuongTu;

    @Column(name = "MucLuongDen", length = 255)
    private String mucLuongDen;

    @Column(name = "KinhNghiem")
    private Integer kinhNghiem;

    @Column(name = "SoLuongTuyen")
    private Integer soLuongTuyen;

    @Column(name = "HanNop")
    private LocalDateTime hanNop;

    @Column(name = "TrangThai", length = 60)
    private String trangThai;

    // Liên kết ứng viên qua bảng Association_25
    @OneToMany(mappedBy = "tinTuyenDung", fetch = FetchType.LAZY)
    private List<Association25> ungVienLinks = new ArrayList<>();

    public TinTuyenDung() {
    }

    public TinTuyenDung(String idTd) {
        this.idTd = idTd;
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

    public String getYeuCau() {
        return yeuCau;
    }

    public void setYeuCau(String yeuCau) {
        this.yeuCau = yeuCau;
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

    public List<Association25> getUngVienLinks() {
        return ungVienLinks;
    }

    public void setUngVienLinks(List<Association25> ungVienLinks) {
        this.ungVienLinks = ungVienLinks;
    }
}