package com.mathbridge.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "HocSinh")
public class HocSinh {

    @Id
    @Column(name = "ID_HS", length = 10, nullable = false)
    private String idHs;

    // FK -> TaiKhoan(ID_TK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_TK", nullable = false, referencedColumnName = "ID_TK")
    private TaiKhoan taiKhoan;

    @Column(name = "Ho", length = 100, nullable = false)
    private String ho;

    @Column(name = "TenDem", length = 100)
    private String tenDem;

    @Column(name = "Ten", length = 100, nullable = false)
    private String ten;

    @Column(name = "Email", length = 100, nullable = false)
    private String email;

    @Column(name = "SDT", length = 100, nullable = false)
    private String sdt;

    @Column(name = "GioiTinh", nullable = false)
    private Boolean gioiTinh;

    @Column(name = "DiaChi", length = 100, nullable = false)
    private String diaChi;

    @Column(name = "ThoiGianTao")
    private LocalDateTime thoiGianTao;

    @Column(name = "ThoiGianCapNhat", nullable = false)
    private LocalDateTime thoiGianCapNhat;

    @Column(name = "ThoiDiemXoa")
    private LocalDateTime thoiDiemXoa;

    @Column(name = "TrangThaiHoatDong", nullable = false)
    private Boolean trangThaiHoatDong;

    // 1 HocSinh -> n BaiNop
    @OneToMany(mappedBy = "hocSinh", fetch = FetchType.LAZY)
    private List<BaiNop> baiNops = new ArrayList<>();

    // 1 HocSinh -> n KetQuaHocTap
    @OneToMany(mappedBy = "hocSinh", fetch = FetchType.LAZY)
    private List<KetQuaHocTap> ketQuaHocTaps = new ArrayList<>();

    // 1 HocSinh -> n HoaDon
    @OneToMany(mappedBy = "hocSinh", fetch = FetchType.LAZY)
    private List<HoaDon> hoaDons = new ArrayList<>();

    // HocSinh đăng ký nhiều LopHoc qua DangKyLH
    @OneToMany(mappedBy = "hocSinh", fetch = FetchType.LAZY)
    private List<DangKyLH> dangKyLHs = new ArrayList<>();

    public HocSinh() {
    }

    public HocSinh(String idHs) {
        this.idHs = idHs;
    }

    public String getIdHs() {
        return idHs;
    }

    public void setIdHs(String idHs) {
        this.idHs = idHs;
    }

    public TaiKhoan getTaiKhoan() {
        return taiKhoan;
    }

    public void setTaiKhoan(TaiKhoan taiKhoan) {
        this.taiKhoan = taiKhoan;
    }

    public String getHo() {
        return ho;
    }

    public void setHo(String ho) {
        this.ho = ho;
    }

    public String getTenDem() {
        return tenDem;
    }

    public void setTenDem(String tenDem) {
        this.tenDem = tenDem;
    }

    public String getTen() {
        return ten;
    }

    public void setTen(String ten) {
        this.ten = ten;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSdt() {
        return sdt;
    }

    public void setSdt(String sdt) {
        this.sdt = sdt;
    }

    public Boolean getGioiTinh() {
        return gioiTinh;
    }

    public void setGioiTinh(Boolean gioiTinh) {
        this.gioiTinh = gioiTinh;
    }

    public String getDiaChi() {
        return diaChi;
    }

    public void setDiaChi(String diaChi) {
        this.diaChi = diaChi;
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

    public LocalDateTime getThoiDiemXoa() {
        return thoiDiemXoa;
    }

    public void setThoiDiemXoa(LocalDateTime thoiDiemXoa) {
        this.thoiDiemXoa = thoiDiemXoa;
    }

    public Boolean getTrangThaiHoatDong() {
        return trangThaiHoatDong;
    }

    public void setTrangThaiHoatDong(Boolean trangThaiHoatDong) {
        this.trangThaiHoatDong = trangThaiHoatDong;
    }

    public List<BaiNop> getBaiNops() {
        return baiNops;
    }

    public void setBaiNops(List<BaiNop> baiNops) {
        this.baiNops = baiNops;
    }

    public List<KetQuaHocTap> getKetQuaHocTaps() {
        return ketQuaHocTaps;
    }

    public void setKetQuaHocTaps(List<KetQuaHocTap> ketQuaHocTaps) {
        this.ketQuaHocTaps = ketQuaHocTaps;
    }

    public List<HoaDon> getHoaDons() {
        return hoaDons;
    }

    public void setHoaDons(List<HoaDon> hoaDons) {
        this.hoaDons = hoaDons;
    }

    public List<DangKyLH> getDangKyLHs() {
        return dangKyLHs;
    }

    public void setDangKyLHs(List<DangKyLH> dangKyLHs) {
        this.dangKyLHs = dangKyLHs;
    }
}
