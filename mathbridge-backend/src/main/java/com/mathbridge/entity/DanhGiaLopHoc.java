package com.mathbridge.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "DanhGiaLopHoc")
public class DanhGiaLopHoc {

    @Id
    @Column(name = "ID_DGLH", length = 10, nullable = false)
    private String idDglh;

    // FK -> HocSinh(ID_HS)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_HS", nullable = false, referencedColumnName = "ID_HS")
    private HocSinh hocSinh;

    // FK -> LopHoc(ID_LH)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_LH", nullable = false, referencedColumnName = "ID_LH")
    private LopHoc lopHoc;

    @Column(name = "DiemDanhGia")
    private Integer diemDanhGia; // 1-5 sao, 5 sao = 5 điểm

    @Column(name = "NhanXet", length = 500)
    private String nhanXet; // Nhận xét đánh giá

    @Column(name = "ThoiDiemDanhGia")
    private LocalDateTime thoiDiemDanhGia; // Thời điểm đánh giá

    public DanhGiaLopHoc() {
    }

    public DanhGiaLopHoc(String idDglh) {
        this.idDglh = idDglh;
    }

    public String getIdDglh() {
        return idDglh;
    }

    public void setIdDglh(String idDglh) {
        this.idDglh = idDglh;
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

