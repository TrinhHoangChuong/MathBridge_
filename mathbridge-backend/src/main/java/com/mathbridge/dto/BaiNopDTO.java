package com.mathbridge.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BaiNopDTO {
    private String idBn;
    private String idBt;
    private String idHs;
    private String hoTen;
    private String fileUrl;
    private BigDecimal diemSo;
    private String nhanXet;
    private String trangThai;
    private String ghiChu;
    private LocalDateTime ngayNop;
    private LocalDateTime thoiGianNop; // Alias for ngayNop
    private LocalDateTime ngayKetThuc; // Hạn nộp của bài tập
    private Integer tongSoCau;
    private Integer soCauDung;

    public BaiNopDTO() {
    }

    public String getIdBn() {
        return idBn;
    }

    public void setIdBn(String idBn) {
        this.idBn = idBn;
    }

    public String getIdBt() {
        return idBt;
    }

    public void setIdBt(String idBt) {
        this.idBt = idBt;
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

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public BigDecimal getDiemSo() {
        return diemSo;
    }

    public void setDiemSo(BigDecimal diemSo) {
        this.diemSo = diemSo;
    }

    public String getNhanXet() {
        return nhanXet;
    }

    public void setNhanXet(String nhanXet) {
        this.nhanXet = nhanXet;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }

    public String getGhiChu() {
        return ghiChu;
    }

    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }

    public LocalDateTime getNgayNop() {
        return ngayNop;
    }

    public void setNgayNop(LocalDateTime ngayNop) {
        this.ngayNop = ngayNop;
    }

    public Integer getTongSoCau() {
        return tongSoCau;
    }

    public void setTongSoCau(Integer tongSoCau) {
        this.tongSoCau = tongSoCau;
    }

    public Integer getSoCauDung() {
        return soCauDung;
    }

    public void setSoCauDung(Integer soCauDung) {
        this.soCauDung = soCauDung;
    }

    public LocalDateTime getThoiGianNop() {
        return thoiGianNop != null ? thoiGianNop : ngayNop;
    }

    public void setThoiGianNop(LocalDateTime thoiGianNop) {
        this.thoiGianNop = thoiGianNop;
        if (ngayNop == null) {
            this.ngayNop = thoiGianNop;
        }
    }

    public LocalDateTime getNgayKetThuc() {
        return ngayKetThuc;
    }

    public void setNgayKetThuc(LocalDateTime ngayKetThuc) {
        this.ngayKetThuc = ngayKetThuc;
    }
}

