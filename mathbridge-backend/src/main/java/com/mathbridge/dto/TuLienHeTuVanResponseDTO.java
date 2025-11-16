package com.mathbridge.dto;

import java.time.LocalDateTime;

public class TuLienHeTuVanResponseDTO {
    private String idTv;
    private String hoTen;
    private String email;
    private String sdt;
    private String tieuDe;
    private String noiDung;
    private String hinhThucTuVan;
    private LocalDateTime thoiDiemTao;
    private String trangThai;

    public TuLienHeTuVanResponseDTO() {}

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

