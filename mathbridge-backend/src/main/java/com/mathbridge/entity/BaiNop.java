package com.mathbridge.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "BaiNop")
public class BaiNop {

    @Id
    @Column(name = "ID_BN", length = 10, nullable = false)
    private String idBn;

    // FK -> BaiTap(ID_BT)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_BT", referencedColumnName = "ID_BT")
    private BaiTap baiTap;

    // FK -> HocSinh(ID_HS)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_HS", referencedColumnName = "ID_HS")
    private HocSinh hocSinh;

    @Column(name = "FileURL", length = 400)
    private String fileUrl;

    @Column(name = "DiemSo")
    private BigDecimal diemSo;

    @Column(name = "NhanXet", length = 255)
    private String nhanXet;

    @Column(name = "TrangThai", length = 60)
    private String trangThai;

    @Column(name = "GhiChu", length = 200)
    private String ghiChu;

    public BaiNop() {
    }

    public BaiNop(String idBn) {
        this.idBn = idBn;
    }

    public String getIdBn() {
        return idBn;
    }

    public void setIdBn(String idBn) {
        this.idBn = idBn;
    }

    public BaiTap getBaiTap() {
        return baiTap;
    }

    public void setBaiTap(BaiTap baiTap) {
        this.baiTap = baiTap;
    }

    public HocSinh getHocSinh() {
        return hocSinh;
    }

    public void setHocSinh(HocSinh hocSinh) {
        this.hocSinh = hocSinh;
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
}
