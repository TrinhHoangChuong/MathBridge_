package com.mathbridge.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "LienHeTuVan")
public class LienHeTuVan {

    @Id
    @Column(name = "ID_TV", length = 10, nullable = false)
    private String idTv;

    @Column(name = "HoTen", length = 100, nullable = false)
    private String hoTen;

    @Column(name = "Email", length = 100)
    private String email;

    @Column(name = "SDT", length = 100, nullable = false)
    private String sdt;

    @Column(name = "TieuDe", length = 100, nullable = false)
    private String tieuDe;

    @Column(name = "NoiDung", length = 200)
    private String noiDung;

    @Column(name = "HinhThucTuVan", length = 100, nullable = false)
    private String hinhThucTuVan;

    @Column(name = "ThoiDiemTao")
    private LocalDateTime thoiDiemTao;

    @Column(name = "TrangThai", length = 60)
    private String trangThai;

    public LienHeTuVan() {
    }

    public LienHeTuVan(String idTv) {
        this.idTv = idTv;
    }

    public String getIdTv() {
        return idTv;
    }

    public void setIdTv(String idTv) {
        this.idTv = idTv;
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

    public String getSdt() {
        return sdt;
    }

    public void setSdt(String sdt) {
        this.sdt = sdt;
    }

    public String getTieuDe() {
        return tieuDe;
    }

    public void setTieuDe(String tieuDe) {
        this.tieuDe = tieuDe;
    }

    public String getNoiDung() {
        return noiDung;
    }

    public void setNoiDung(String noiDung) {
        this.noiDung = noiDung;
    }

    public String getHinhThucTuVan() {
        return hinhThucTuVan;
    }

    public void setHinhThucTuVan(String hinhThucTuVan) {
        this.hinhThucTuVan = hinhThucTuVan;
    }

    public LocalDateTime getThoiDiemTao() {
        return thoiDiemTao;
    }

    public void setThoiDiemTao(LocalDateTime thoiDiemTao) {
        this.thoiDiemTao = thoiDiemTao;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }
}