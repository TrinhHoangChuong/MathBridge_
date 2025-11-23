package com.mathbridge.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "CoVan_HocSinh")
public class CoVanHocSinh {

    @EmbeddedId
    private CoVanHocSinhId id;

    // FK -> NhanVien(ID_NV)
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idNv")
    @JoinColumn(name = "ID_NV", nullable = false, referencedColumnName = "ID_NV")
    private NhanVien nhanVien;

    // FK -> HocSinh(ID_HS)
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idHs")
    @JoinColumn(name = "ID_HS", nullable = false, referencedColumnName = "ID_HS")
    private HocSinh hocSinh;

    @Column(name = "NgayKetThuc")
    private LocalDateTime ngayKetThuc;

    @Column(name = "TrangThai", length = 60)
    private String trangThai; // Dang phu trach / Tam dung / Ket thuc

    @Column(name = "GhiChu", length = 200)
    private String ghiChu;

    public CoVanHocSinh() {
    }

    public CoVanHocSinh(CoVanHocSinhId id) {
        this.id = id;
    }

    public CoVanHocSinhId getId() {
        return id;
    }

    public void setId(CoVanHocSinhId id) {
        this.id = id;
    }

    public NhanVien getNhanVien() {
        return nhanVien;
    }

    public void setNhanVien(NhanVien nhanVien) {
        this.nhanVien = nhanVien;
    }

    public HocSinh getHocSinh() {
        return hocSinh;
    }

    public void setHocSinh(HocSinh hocSinh) {
        this.hocSinh = hocSinh;
    }

    public LocalDateTime getNgayBatDau() {
        return id != null ? id.getNgayBatDau() : null;
    }

    public void setNgayBatDau(LocalDateTime ngayBatDau) {
        if (id == null) {
            id = new CoVanHocSinhId();
        }
        id.setNgayBatDau(ngayBatDau);
    }

    public LocalDateTime getNgayKetThuc() {
        return ngayKetThuc;
    }

    public void setNgayKetThuc(LocalDateTime ngayKetThuc) {
        this.ngayKetThuc = ngayKetThuc;
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

