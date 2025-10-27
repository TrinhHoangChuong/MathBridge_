package com.mathbridge.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "BaiTap")
public class BaiTap {

    @Id
    @Column(name = "ID_BT", length = 10, nullable = false)
    private String idBt;

    // FK -> BuoiHocChiTiet(ID_BH)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_BH", referencedColumnName = "ID_BH")
    private BuoiHocChiTiet buoiHocChiTiet;

    @Column(name = "TieuDe", length = 100, nullable = false)
    private String tieuDe;

    @Column(name = "MoTa", length = 200)
    private String moTa;

    @Column(name = "LoaiBT", length = 100)
    private String loaiBt;

    @Column(name = "FileURL", length = 400)
    private String fileUrl;

    @Column(name = "TaiLieuURL", length = 255)
    private String taiLieuUrl;

    @Column(name = "NgayBatDau", nullable = false)
    private LocalDateTime ngayBatDau;

    @Column(name = "NgayKetThuc", nullable = false)
    private LocalDateTime ngayKetThuc;

    @Column(name = "GhiChu", length = 200)
    private String ghiChu;

    // One BaiTap -> many BaiNop
    @OneToMany(mappedBy = "baiTap", fetch = FetchType.LAZY)
    private List<BaiNop> baiNops = new ArrayList<>();

    public BaiTap() {
    }

    public BaiTap(String idBt) {
        this.idBt = idBt;
    }

    public String getIdBt() {
        return idBt;
    }

    public void setIdBt(String idBt) {
        this.idBt = idBt;
    }

    public BuoiHocChiTiet getBuoiHocChiTiet() {
        return buoiHocChiTiet;
    }

    public void setBuoiHocChiTiet(BuoiHocChiTiet buoiHocChiTiet) {
        this.buoiHocChiTiet = buoiHocChiTiet;
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

    public List<BaiNop> getBaiNops() {
        return baiNops;
    }

    public void setBaiNops(List<BaiNop> baiNops) {
        this.baiNops = baiNops;
    }
}
