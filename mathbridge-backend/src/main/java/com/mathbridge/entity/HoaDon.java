package com.mathbridge.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "HoaDon")
public class HoaDon {

    @Id
    @Column(name = "ID_HoaDon", length = 10, nullable = false)
    private String idHoaDon;

    // FK -> LopHoc(ID_LH)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_LH", nullable = false, referencedColumnName = "ID_LH")
    private LopHoc lopHoc;

    // FK -> LichSuThanhToan(ID_LS)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_LS", referencedColumnName = "ID_LS")
    private LichSuThanhToan lichSuThanhToan;

    // FK -> HocSinh(ID_HS)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_HS", nullable = false, referencedColumnName = "ID_HS")
    private HocSinh hocSinh;

    @Column(name = "NgayDangKy")
    private LocalDate ngayDangKy;

    @Column(name = "NgayThanhToan")
    private LocalDate ngayThanhToan;

    @Column(name = "HanThanhToan")
    private LocalDate hanThanhToan;

    @Column(name = "SoThang", length = 100)
    private String soThang;

    @Column(name = "TongTien")
    private BigDecimal tongTien;

    @Column(name = "TrangThai", length = 60)
    private String trangThai;

    public HoaDon() {
    }

    public HoaDon(String idHoaDon) {
        this.idHoaDon = idHoaDon;
    }

    public String getIdHoaDon() {
        return idHoaDon;
    }

    public void setIdHoaDon(String idHoaDon) {
        this.idHoaDon = idHoaDon;
    }

    public LopHoc getLopHoc() {
        return lopHoc;
    }

    public void setLopHoc(LopHoc lopHoc) {
        this.lopHoc = lopHoc;
    }

    public LichSuThanhToan getLichSuThanhToan() {
        return lichSuThanhToan;
    }

    public void setLichSuThanhToan(LichSuThanhToan lichSuThanhToan) {
        this.lichSuThanhToan = lichSuThanhToan;
    }

    public HocSinh getHocSinh() {
        return hocSinh;
    }

    public void setHocSinh(HocSinh hocSinh) {
        this.hocSinh = hocSinh;
    }

    public LocalDate getNgayDangKy() {
        return ngayDangKy;
    }

    public void setNgayDangKy(LocalDate ngayDangKy) {
        this.ngayDangKy = ngayDangKy;
    }

    public LocalDate getNgayThanhToan() {
        return ngayThanhToan;
    }

    public void setNgayThanhToan(LocalDate ngayThanhToan) {
        this.ngayThanhToan = ngayThanhToan;
    }

    public LocalDate getHanThanhToan() {
        return hanThanhToan;
    }

    public void setHanThanhToan(LocalDate hanThanhToan) {
        this.hanThanhToan = hanThanhToan;
    }

    public String getSoThang() {
        return soThang;
    }

    public void setSoThang(String soThang) {
        this.soThang = soThang;
    }

    public BigDecimal getTongTien() {
        return tongTien;
    }

    public void setTongTien(BigDecimal tongTien) {
        this.tongTien = tongTien;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }
}
