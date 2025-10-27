package com.mathbridge.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "LopHoc")
public class LopHoc {

    @Id
    @Column(name = "ID_LH", length = 10, nullable = false)
    private String idLh;

    // FK -> NhanVien(ID_NV)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_NV", nullable = false, referencedColumnName = "ID_NV")
    private NhanVien nhanVien;

    // FK -> ChuongTrinh(ID_CT)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_CT", nullable = false, referencedColumnName = "ID_CT")
    private ChuongTrinh chuongTrinh;

    @Column(name = "TenLop", length = 100, nullable = false)
    private String tenLop;

    @Column(name = "LoaiNgay", length = 100, nullable = false)
    private String loaiNgay;

    @Column(name = "SoBuoi", length = 100, nullable = false)
    private String soBuoi;

    @Column(name = "HinhThucHoc", length = 100, nullable = false)
    private String hinhThucHoc;

    @Column(name = "NgayBatDau", nullable = false)
    private LocalDateTime ngayBatDau;

    @Column(name = "MucGia_thang", nullable = false)
    private BigDecimal mucGiaThang;

    @Column(name = "DanhGia", length = 200)
    private String danhGia;

    @Column(name = "TrangThai", length = 60)
    private String trangThai;

    @Column(name = "MoTa", length = 200)
    private String moTa;

    // 1 LopHoc -> n BuoiHocChiTiet
    @OneToMany(mappedBy = "lopHoc", fetch = FetchType.LAZY)
    private List<BuoiHocChiTiet> buoiHocChiTiets = new ArrayList<>();

    // 1 LopHoc -> n DangKyLH
    @OneToMany(mappedBy = "lopHoc", fetch = FetchType.LAZY)
    private List<DangKyLH> dangKyLHs = new ArrayList<>();

    // 1 LopHoc -> n HoaDon
    @OneToMany(mappedBy = "lopHoc", fetch = FetchType.LAZY)
    private List<HoaDon> hoaDons = new ArrayList<>();

    // 1 LopHoc -> n YeuCauHoTro
    @OneToMany(mappedBy = "lopHoc", fetch = FetchType.LAZY)
    private List<YeuCauHoTro> yeuCauHoTrosWorkaround; // We'll correct name below
    // Wait: I made a typo in class "YeuCauHoTro". We'll fix properly in final class.
    // We cannot refer to YeuCauHoTro before it's declared? It's okay in Java to refer to a class declared later.
    // We'll fix field name to List<YeuCauHoTro> yeuCauHoTros;

    @OneToMany(mappedBy = "lopHoc", fetch = FetchType.LAZY)
    private List<YeuCauHoTro> yeuCauHoTros = new ArrayList<>();

    public LopHoc() {
    }

    public LopHoc(String idLh) {
        this.idLh = idLh;
    }

    public String getIdLh() {
        return idLh;
    }

    public void setIdLh(String idLh) {
        this.idLh = idLh;
    }

    public NhanVien getNhanVien() {
        return nhanVien;
    }

    public void setNhanVien(NhanVien nhanVien) {
        this.nhanVien = nhanVien;
    }

    public ChuongTrinh getChuongTrinh() {
        return chuongTrinh;
    }

    public void setChuongTrinh(ChuongTrinh chuongTrinh) {
        this.chuongTrinh = chuongTrinh;
    }

    public String getTenLop() {
        return tenLop;
    }

    public void setTenLop(String tenLop) {
        this.tenLop = tenLop;
    }

    public String getLoaiNgay() {
        return loaiNgay;
    }

    public void setLoaiNgay(String loaiNgay) {
        this.loaiNgay = loaiNgay;
    }

    public String getSoBuoi() {
        return soBuoi;
    }

    public void setSoBuoi(String soBuoi) {
        this.soBuoi = soBuoi;
    }

    public String getHinhThucHoc() {
        return hinhThucHoc;
    }

    public void setHinhThucHoc(String hinhThucHoc) {
        this.hinhThucHoc = hinhThucHoc;
    }

    public LocalDateTime getNgayBatDau() {
        return ngayBatDau;
    }

    public void setNgayBatDau(LocalDateTime ngayBatDau) {
        this.ngayBatDau = ngayBatDau;
    }

    public BigDecimal getMucGiaThang() {
        return mucGiaThang;
    }

    public void setMucGiaThang(BigDecimal mucGiaThang) {
        this.mucGiaThang = mucGiaThang;
    }

    public String getDanhGia() {
        return danhGia;
    }

    public void setDanhGia(String danhGia) {
        this.danhGia = danhGia;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }

    public List<BuoiHocChiTiet> getBuoiHocChiTiets() {
        return buoiHocChiTiets;
    }

    public void setBuoiHocChiTiets(List<BuoiHocChiTiet> buoiHocChiTiets) {
        this.buoiHocChiTiets = buoiHocChiTiets;
    }

    public List<DangKyLH> getDangKyLHs() {
        return dangKyLHs;
    }

    public void setDangKyLHs(List<DangKyLH> dangKyLHs) {
        this.dangKyLHs = dangKyLHs;
    }

    public List<HoaDon> getHoaDons() {
        return hoaDons;
    }

    public void setHoaDons(List<HoaDon> hoaDons) {
        this.hoaDons = hoaDons;
    }

    public List<YeuCauHoTro> getYeuCauHoTros() {
        return yeuCauHoTros;
    }

    public void setYeuCauHoTros(List<YeuCauHoTro> yeuCauHoTros) {
        this.yeuCauHoTros = yeuCauHoTros;
    }
}
