package com.mathbridge.dto;

import java.time.LocalDateTime;

public class BaiTapDTO {
    private String idBt;
    private String idBh;
    private String idLh;
    private String tieuDe;
    private String moTa;
    private String loaiBt; // BAI_TAP, KIEM_TRA_15P, KIEM_TRA_45P, THI_HK
    private String fileUrl;
    private String taiLieuUrl;
    private LocalDateTime ngayBatDau;
    private LocalDateTime ngayKetThuc;
    private String ghiChu;
    private Integer soBaiNop;
    private Integer soBaiDaCham;
    private String tenLop;
    private String tenCaHoc;

    public BaiTapDTO() {
    }

    public String getIdBt() {
        return idBt;
    }

    public void setIdBt(String idBt) {
        this.idBt = idBt;
    }

    public String getIdBh() {
        return idBh;
    }

    public void setIdBh(String idBh) {
        this.idBh = idBh;
    }

    public String getIdLh() {
        return idLh;
    }

    public void setIdLh(String idLh) {
        this.idLh = idLh;
    }

    public String getTieuDe() {
        return tieuDe;
    }

    public void setTieuDe(String tieuDe) {
        this.tieuDe = tieuDe;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }

    public String getLoaiBt() {
        return loaiBt;
    }

    public void setLoaiBt(String loaiBt) {
        this.loaiBt = loaiBt;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getTaiLieuUrl() {
        return taiLieuUrl;
    }

    public void setTaiLieuUrl(String taiLieuUrl) {
        this.taiLieuUrl = taiLieuUrl;
    }

    public LocalDateTime getNgayBatDau() {
        return ngayBatDau;
    }

    public void setNgayBatDau(LocalDateTime ngayBatDau) {
        this.ngayBatDau = ngayBatDau;
    }

    public LocalDateTime getNgayKetThuc() {
        return ngayKetThuc;
    }

    public void setNgayKetThuc(LocalDateTime ngayKetThuc) {
        this.ngayKetThuc = ngayKetThuc;
    }

    public String getGhiChu() {
        return ghiChu;
    }

    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }

    public Integer getSoBaiNop() {
        return soBaiNop;
    }

    public void setSoBaiNop(Integer soBaiNop) {
        this.soBaiNop = soBaiNop;
    }

    public Integer getSoBaiDaCham() {
        return soBaiDaCham;
    }

    public void setSoBaiDaCham(Integer soBaiDaCham) {
        this.soBaiDaCham = soBaiDaCham;
    }

    public String getTenLop() {
        return tenLop;
    }

    public void setTenLop(String tenLop) {
        this.tenLop = tenLop;
    }

    public String getTenCaHoc() {
        return tenCaHoc;
    }

    public void setTenCaHoc(String tenCaHoc) {
        this.tenCaHoc = tenCaHoc;
    }
}

