package com.mathbridge.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "TinTuyenDung", schema = "dbo")
public class TinTuyenDung {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_TD")
    private Long id;

    @Column(name = "TieuDe")
    private String tieuDe;

    @Column(name = "ViTri")
    private String viTri;

    @Column(name = "MoTaNgan", columnDefinition = "TEXT")
    private String moTaNgan;

    @Column(name = "MoTa", columnDefinition = "TEXT")
    private String moTa;

    @Column(name = "YeuCau", columnDefinition = "TEXT")
    private String yeuCau;

    @Column(name = "CapBac")
    private String capBac;

    @Column(name = "HinhThucLamViec")
    private String hinhThucLamViec;

    @Column(name = "MucLuongTu")
    private String mucLuongTu;

    @Column(name = "MucLuongDen")
    private String mucLuongDen;

    @Column(name = "KinhNghiem")
    private String kinhNghiem;

    @Column(name = "SoLuongTuyen")
    private Integer soLuongTuyen;

    @Column(name = "HanNop")
    private String hanNop;

    @Column(name = "TrangThai")
    private Integer trangThai;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public TinTuyenDung() {
    }

    // ===== getters / setters =====
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
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

    public String getKinhNghiem() {
        return kinhNghiem;
    }

    public void setKinhNghiem(String kinhNghiem) {
        this.kinhNghiem = kinhNghiem;
    }

    public Integer getSoLuongTuyen() {
        return soLuongTuyen;
    }

    public void setSoLuongTuyen(Integer soLuongTuyen) {
        this.soLuongTuyen = soLuongTuyen;
    }

    public String getHanNop() {
        return hanNop;
    }

    public void setHanNop(String hanNop) {
        this.hanNop = hanNop;
    }

    public Integer getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Integer trangThai) {
        this.trangThai = trangThai;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
