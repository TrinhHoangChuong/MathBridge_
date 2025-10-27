package com.mathbridge.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Phong")
public class Phong {

    @Id
    @Column(name = "ID_Phong", length = 10, nullable = false)
    private String idPhong;

    // FK -> CoSo(ID_CS)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_CS", nullable = false, referencedColumnName = "ID_CS")
    private CoSo coSo;

    @Column(name = "TenPhong", length = 100, nullable = false)
    private String tenPhong;

    @Column(name = "Tang", length = 3)
    private String tang;

    @Column(name = "LoaiPhong", length = 100)
    private String loaiPhong;

    @Column(name = "GhiChu", length = 200)
    private String ghiChu;

    // 1 Phong -> n BuoiHocChiTiet
    @OneToMany(mappedBy = "phong", fetch = FetchType.LAZY)
    private List<BuoiHocChiTiet> buoiHocChiTiets = new ArrayList<>();

    public Phong() {
    }

    public Phong(String idPhong) {
        this.idPhong = idPhong;
    }

    public String getIdPhong() {
        return idPhong;
    }

    public void setIdPhong(String idPhong) {
        this.idPhong = idPhong;
    }

    public CoSo getCoSo() {
        return coSo;
    }

    public void setCoSo(CoSo coSo) {
        this.coSo = coSo;
    }

    public String getTenPhong() {
        return tenPhong;
    }

    public void setTenPhong(String tenPhong) {
        this.tenPhong = tenPhong;
    }

    public String getTang() {
        return tang;
    }

    public void setTang(String tang) {
        this.tang = tang;
    }

    public String getLoaiPhong() {
        return loaiPhong;
    }

    public void setLoaiPhong(String loaiPhong) {
        this.loaiPhong = loaiPhong;
    }

    public String getGhiChu() {
        return ghiChu;
    }

    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }

    public List<BuoiHocChiTiet> getBuoiHocChiTiets() {
        return buoiHocChiTiets;
    }

    public void setBuoiHocChiTiets(List<BuoiHocChiTiet> buoiHocChiTiets) {
        this.buoiHocChiTiets = buoiHocChiTiets;
    }
}
