package com.mathbridge.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "BuoiHocChiTiet")
public class BuoiHocChiTiet {

    @Id
    @Column(name = "ID_BH", length = 10, nullable = false)
    private String idBh;

    // FK -> Phong(ID_Phong)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_Phong", nullable = false, referencedColumnName = "ID_Phong")
    private Phong phong;

    // FK -> LopHoc(ID_LH)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_LH", nullable = false, referencedColumnName = "ID_LH")
    private LopHoc lopHoc;

    @Column(name = "TenCaHoc", length = 100, nullable = false)
    private String tenCaHoc;

    @Column(name = "ThuTuBuoiHoc", length = 100, nullable = false)
    private String thuTuBuoiHoc;

    @Column(name = "NgayHoc", nullable = false)
    private LocalDateTime ngayHoc;

    @Column(name = "GioBatDau", nullable = false)
    private LocalDateTime gioBatDau;

    @Column(name = "GioKetThuc", nullable = false)
    private LocalDateTime gioKetThuc;

    @Column(name = "NoiDung", length = 200)
    private String noiDung;

    @Column(name = "GhiChu", length = 200)
    private String ghiChu;

    // Note: Đánh giá buổi học được lưu trong entity DanhGiaBuoiHoc riêng biệt
    // Không còn lưu DiemDanhGia và NhanXetDanhGia trong BuoiHocChiTiet

    // 1 BuoiHocChiTiet -> n BaiTap
    @OneToMany(mappedBy = "buoiHocChiTiet", fetch = FetchType.LAZY)
    private List<BaiTap> baiTaps = new ArrayList<>();

    public BuoiHocChiTiet() {
    }

    public BuoiHocChiTiet(String idBh) {
        this.idBh = idBh;
    }

    public String getIdBh() {
        return idBh;
    }

    public void setIdBh(String idBh) {
        this.idBh = idBh;
    }

    public Phong getPhong() {
        return phong;
    }

    public void setPhong(Phong phong) {
        this.phong = phong;
    }

    public LopHoc getLopHoc() {
        return lopHoc;
    }

    public void setLopHoc(LopHoc lopHoc) {
        this.lopHoc = lopHoc;
    }

    public String getTenCaHoc() {
        return tenCaHoc;
    }

    public void setTenCaHoc(String tenCaHoc) {
        this.tenCaHoc = tenCaHoc;
    }

    public String getThuTuBuoiHoc() {
        return thuTuBuoiHoc;
    }

    public void setThuTuBuoiHoc(String thuTuBuoiHoc) {
        this.thuTuBuoiHoc = thuTuBuoiHoc;
    }

    public LocalDateTime getNgayHoc() {
        return ngayHoc;
    }

    public void setNgayHoc(LocalDateTime ngayHoc) {
        this.ngayHoc = ngayHoc;
    }

    public LocalDateTime getGioBatDau() {
        return gioBatDau;
    }

    public void setGioBatDau(LocalDateTime gioBatDau) {
        this.gioBatDau = gioBatDau;
    }

    public LocalDateTime getGioKetThuc() {
        return gioKetThuc;
    }

    public void setGioKetThuc(LocalDateTime gioKetThuc) {
        this.gioKetThuc = gioKetThuc;
    }

    public String getNoiDung() {
        return noiDung;
    }

    public void setNoiDung(String noiDung) {
        this.noiDung = noiDung;
    }

    public String getGhiChu() {
        return ghiChu;
    }

    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }

    public List<BaiTap> getBaiTaps() {
        return baiTaps;
    }

    public void setBaiTaps(List<BaiTap> baiTaps) {
        this.baiTaps = baiTaps;
    }
}
