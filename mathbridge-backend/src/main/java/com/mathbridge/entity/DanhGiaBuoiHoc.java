package com.mathbridge.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "DanhGiaBuoiHoc")
public class DanhGiaBuoiHoc {

    @Id
    @Column(name = "ID_DGBH", length = 10, nullable = false)
    private String idDgbh;

    // FK -> HocSinh(ID_HS)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_HS", nullable = false, referencedColumnName = "ID_HS")
    private HocSinh hocSinh;

    // FK -> BuoiHocChiTiet(ID_BH)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_BH", nullable = false, referencedColumnName = "ID_BH")
    private BuoiHocChiTiet buoiHocChiTiet;

    @Column(name = "DiemDanhGia")
    private Integer diemDanhGia; // 1-5 sao, 5 sao = 5 điểm

    @Column(name = "NhanXet", length = 500)
    private String nhanXet; // Nhận xét đánh giá

    @Column(name = "ThoiDiemDanhGia")
    private LocalDateTime thoiDiemDanhGia; // Thời điểm đánh giá

    public DanhGiaBuoiHoc() {
    }

    public DanhGiaBuoiHoc(String idDgbh) {
        this.idDgbh = idDgbh;
    }

    public String getIdDgbh() {
        return idDgbh;
    }

    public void setIdDgbh(String idDgbh) {
        this.idDgbh = idDgbh;
    }

    public HocSinh getHocSinh() {
        return hocSinh;
    }

    public void setHocSinh(HocSinh hocSinh) {
        this.hocSinh = hocSinh;
    }

    public BuoiHocChiTiet getBuoiHocChiTiet() {
        return buoiHocChiTiet;
    }

    public void setBuoiHocChiTiet(BuoiHocChiTiet buoiHocChiTiet) {
        this.buoiHocChiTiet = buoiHocChiTiet;
    }

    public Integer getDiemDanhGia() {
        return diemDanhGia;
    }

    public void setDiemDanhGia(Integer diemDanhGia) {
        this.diemDanhGia = diemDanhGia;
    }

    public String getNhanXet() {
        return nhanXet;
    }

    public void setNhanXet(String nhanXet) {
        this.nhanXet = nhanXet;
    }

    public LocalDateTime getThoiDiemDanhGia() {
        return thoiDiemDanhGia;
    }

    public void setThoiDiemDanhGia(LocalDateTime thoiDiemDanhGia) {
        this.thoiDiemDanhGia = thoiDiemDanhGia;
    }
}

