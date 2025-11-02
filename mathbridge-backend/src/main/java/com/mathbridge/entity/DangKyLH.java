package com.mathbridge.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "DangKyLH")
public class DangKyLH {

    @EmbeddedId
    private DangKyLHId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idHs")
    @JoinColumn(name = "ID_HS", nullable = false, referencedColumnName = "ID_HS")
    private HocSinh hocSinh;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idLh")
    @JoinColumn(name = "ID_LH", nullable = false, referencedColumnName = "ID_LH")
    private LopHoc lopHoc;

    @Column(name = "TrangThai")
    private String trangThai; // open, pending, end, approved, rejected

    public DangKyLH() {
    }

    public DangKyLH(DangKyLHId id) {
        this.id = id;
    }

    public DangKyLHId getId() {
        return id;
    }

    public void setId(DangKyLHId id) {
        this.id = id;
    }

    public HocSinh getHocSinh() {
        return hocSinh;
    }

    public void setHocSinh(HocSinh hocSinh) {
        this.hocSinh = hocSinh;
    }

    public LopHoc getLopHoc() {
        return lopHoc;
    }

    public void setLopHoc(LopHoc lopHoc) {
        this.lopHoc = lopHoc;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }
}
