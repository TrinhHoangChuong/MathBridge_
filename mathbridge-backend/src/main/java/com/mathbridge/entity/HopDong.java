package com.mathbridge.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "HopDong")
public class HopDong {

    @Id
    @Column(name = "ID_HD", length = 10, nullable = false)
    private String idHd;

    // FK -> NhanVien(ID_NV)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_NV", nullable = false, referencedColumnName = "ID_NV")
    private NhanVien nhanVien;

    @Column(name = "LoaiHopDong", length = 100, nullable = false)
    private String loaiHopDong;

    @Column(name = "NgayKy", nullable = false)
    private LocalDateTime ngayKy;

    @Column(name = "NgayHieuLuc", nullable = false)
    private LocalDateTime ngayHieuLuc;

    @Column(name = "NgayKetThuc", nullable = false)
    private LocalDateTime ngayKetThuc;

    @Column(name = "TrangThai", length = 60)
    private String trangThai;

    @Column(name = "PhamViCongViec", length = 255)
    private String phamViCongViec;

    @Column(name = "HinhThucDay", length = 100, nullable = false)
    private String hinhThucDay;

    @Column(name = "ChamDutHD")
    private Boolean chamDutHd;

    @Column(name = "NgayChamDutHD")
    private LocalDateTime ngayChamDutHd;

    @Column(name = "ThoiGianTao")
    private LocalDateTime thoiGianTao;

    @Column(name = "ThoiGianCapNhat")
    private LocalDateTime thoiGianCapNhat;

    public HopDong() {
    }

    public HopDong(String idHd) {
        this.idHd = idHd;
    }

    public String getIdHd() {
        return idHd;
    }

    public void setIdHd(String idHd) {
        this.idHd = idHd;
    }

    public NhanVien getNhanVien() {
        return nhanVien;
    }

    public void setNhanVien(NhanVien nhanVien) {
        this.nhanVien = nhanVien;
    }

    public String getLoaiHopDong() {
        return loaiHopDong;
    }

    public void setLoaiHopDong(String loaiHopDong) {
        this.loaiHopDong = loaiHopDong;
    }

    public LocalDateTime getNgayKy() {
        return ngayKy;
    }

    public void setNgayKy(LocalDateTime ngayKy) {
        this.ngayKy = ngayKy;
    }

    public LocalDateTime getNgayHieuLuc() {
        return ngayHieuLuc;
    }

    public void setNgayHieuLuc(LocalDateTime ngayHieuLuc) {
        this.ngayHieuLuc = ngayHieuLuc;
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

    public String getPhamViCongViec() {
        return phamViCongViec;
    }

    public void setPhamViCongViec(String phamViCongViec) {
        this.phamViCongViec = phamViCongViec;
    }

    public String getHinhThucDay() {
        return hinhThucDay;
    }

    public void setHinhThucDay(String hinhThucDay) {
        this.hinhThucDay = hinhThucDay;
    }

    public Boolean getChamDutHd() {
        return chamDutHd;
    }

    public void setChamDutHd(Boolean chamDutHd) {
        this.chamDutHd = chamDutHd;
    }

    public LocalDateTime getNgayChamDutHd() {
        return ngayChamDutHd;
    }

    public void setNgayChamDutHd(LocalDateTime ngayChamDutHd) {
        this.ngayChamDutHd = ngayChamDutHd;
    }

    public LocalDateTime getThoiGianTao() {
        return thoiGianTao;
    }

    public void setThoiGianTao(LocalDateTime thoiGianTao) {
        this.thoiGianTao = thoiGianTao;
    }

    public LocalDateTime getThoiGianCapNhat() {
        return thoiGianCapNhat;
    }

    public void setThoiGianCapNhat(LocalDateTime thoiGianCapNhat) {
        this.thoiGianCapNhat = thoiGianCapNhat;
    }
}
