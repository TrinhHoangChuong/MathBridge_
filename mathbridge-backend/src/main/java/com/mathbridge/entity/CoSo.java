package com.mathbridge.entity;

import jakarta.persistence.*;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "CoSo")
public class CoSo {

    @Id
    @Column(name = "ID_CS", length = 10, nullable = false)
    private String idCs;

    @Column(name = "TENCOSO", length = 200, nullable = false)
    private String tenCoSo;

    @Column(name = "DIACHI2", length = 200, nullable = false)
    private String diaChi2;

    @Column(name = "HOTLINE", length = 100, nullable = false)
    private String hotline;

    @Column(name = "GIOMOCUA", nullable = false)
    private LocalTime gioMoCua;

    @Column(name = "GIODONGCUA", nullable = false)
    private LocalTime gioDongCua;

    @Column(name = "NGAYLAMVIEC", length = 100, nullable = false)
    private String ngayLamViec;

    // 1 CoSo -> n NhanVien
    @OneToMany(mappedBy = "coSo", fetch = FetchType.LAZY)
    private List<NhanVien> nhanViens = new ArrayList<>();

    // 1 CoSo -> n Phong
    @OneToMany(mappedBy = "coSo", fetch = FetchType.LAZY)
    private List<Phong> phongs = new ArrayList<>();

    // Liên kết nhiều-nhiều với ChuongTrinh qua CSDaoTaoCT
    @OneToMany(mappedBy = "coSo", fetch = FetchType.LAZY)
    private List<CSDaoTaoCT> daoTaoCts = new ArrayList<>();

    public CoSo() {
    }

    public CoSo(String idCs) {
        this.idCs = idCs;
    }

    public String getIdCs() {
        return idCs;
    }

    public void setIdCs(String idCs) {
        this.idCs = idCs;
    }

    public String getTenCoSo() {
        return tenCoSo;
    }

    public void setTenCoSo(String tenCoSo) {
        this.tenCoSo = tenCoSo;
    }

    public String getDiaChi2() {
        return diaChi2;
    }

    public void setDiaChi2(String diaChi2) {
        this.diaChi2 = diaChi2;
    }

    public String getHotline() {
        return hotline;
    }

    public void setHotline(String hotline) {
        this.hotline = hotline;
    }

    public LocalTime getGioMoCua() {
        return gioMoCua;
    }

    public void setGioMoCua(LocalTime gioMoCua) {
        this.gioMoCua = gioMoCua;
    }

    public LocalTime getGioDongCua() {
        return gioDongCua;
    }

    public void setGioDongCua(LocalTime gioDongCua) {
        this.gioDongCua = gioDongCua;
    }

    public String getNgayLamViec() {
        return ngayLamViec;
    }

    public void setNgayLamViec(String ngayLamViec) {
        this.ngayLamViec = ngayLamViec;
    }

    public List<NhanVien> getNhanViens() {
        return nhanViens;
    }

    public void setNhanViens(List<NhanVien> nhanViens) {
        this.nhanViens = nhanViens;
    }

    public List<Phong> getPhongs() {
        return phongs;
    }

    public void setPhongs(List<Phong> phongs) {
        this.phongs = phongs;
    }

    public List<CSDaoTaoCT> getDaoTaoCts() {
        return daoTaoCts;
    }

    public void setDaoTaoCts(List<CSDaoTaoCT> daoTaoCts) {
        this.daoTaoCts = daoTaoCts;
    }
}
