package com.mathbridge.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "LichSuThanhToan")
public class LichSuThanhToan {

    @Id
    @Column(name = "ID_LS", length = 10, nullable = false)
    private String idLs;

    // FK -> PhuongThucThanhToan(ID_PT)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_PT", nullable = false, referencedColumnName = "ID_PT")
    private PhuongThucThanhToan phuongThucThanhToan;

    @Column(name = "TongTien", nullable = false)
    private BigDecimal tongTien;

    @Column(name = "TrangThaiThanhToan", length = 100, nullable = false)
    private String trangThaiThanhToan;

    @Column(name = "HinhThuc", length = 255, nullable = false)
    private String hinhThuc;

    @Column(name = "Thang", length = 100)
    private String thang;

    @Column(name = "GhiChu", length = 200)
    private String ghiChu;

    // 1 LichSuThanhToan -> n HoaDon
    @OneToMany(mappedBy = "lichSuThanhToan", fetch = FetchType.LAZY)
    private List<HoaDon> hoaDons = new ArrayList<>();

    public LichSuThanhToan() {
    }

    public LichSuThanhToan(String idLs) {
        this.idLs = idLs;
    }

    public String getIdLs() {
        return idLs;
    }

    public void setIdLs(String idLs) {
        this.idLs = idLs;
    }

    public PhuongThucThanhToan getPhuongThucThanhToan() {
        return phuongThucThanhToan;
    }

    public void setPhuongThucThanhToan(PhuongThucThanhToan phuongThucThanhToan) {
        this.phuongThucThanhToan = phuongThucThanhToan;
    }

    public BigDecimal getTongTien() {
        return tongTien;
    }

    public void setTongTien(BigDecimal tongTien) {
        this.tongTien = tongTien;
    }

    public String getTrangThaiThanhToan() {
        return trangThaiThanhToan;
    }

    public void setTrangThaiThanhToan(String trangThaiThanhToan) {
        this.trangThaiThanhToan = trangThaiThanhToan;
    }

    public String getHinhThuc() {
        return hinhThuc;
    }

    public void setHinhThuc(String hinhThuc) {
        this.hinhThuc = hinhThuc;
    }

    public String getThang() {
        return thang;
    }

    public void setThang(String thang) {
        this.thang = thang;
    }

    public String getGhiChu() {
        return ghiChu;
    }

    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }

    public List<HoaDon> getHoaDons() {
        return hoaDons;
    }

    public void setHoaDons(List<HoaDon> hoaDons) {
        this.hoaDons = hoaDons;
    }
}
