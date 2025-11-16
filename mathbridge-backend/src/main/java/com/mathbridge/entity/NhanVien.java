package com.mathbridge.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "NhanVien")
public class NhanVien {
    @Id
    @Column(name = "ID_NV", length = 10, nullable = false)
    private String idNv;

    // FK -> TaiKhoan(ID_TK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_TK", nullable = false, referencedColumnName = "ID_TK")
    private TaiKhoan taiKhoan;

    // FK -> CoSo(ID_CS)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_CS", nullable = false, referencedColumnName = "ID_CS")
    private CoSo coSo;

    @Column(name = "Ho", length = 100, nullable = false)
    private String ho;

    @Column(name = "TenDem", length = 100)
    private String tenDem;

    @Column(name = "Ten", length = 100, nullable = false)
    private String ten;

    @Column(name = "Email", length = 100, nullable = false)
    private String email;

    @Column(name = "GioiTinh", nullable = false)
    private Boolean gioiTinh;

    @Column(name = "SDT", length = 100, nullable = false)
    private String sdt;

    @Column(name = "ChuyenMon", length = 100)
    private String chuyenMon;

    @Column(name = "KinhNghiem")
    private Integer kinhNghiem;

    @Column(name = "ChucVu", length = 100)
    private String chucVu;

    @Column(name = "ThoiGianTao")
    private LocalDateTime thoiGianTao;

    @Column(name = "ThoiGianCapNhat")
    private LocalDateTime thoiGianCapNhat;

    @Column(name = "ThoiDiemXoa")
    private LocalDateTime thoiDiemXoa;

    @Column(name = "TrangThaiHoatDong")
    private Boolean trangThaiHoatDong;

    // 1 NhanVien -> n LopHoc (phụ trách lớp)
    @OneToMany(mappedBy = "nhanVien", fetch = FetchType.LAZY)
    private List<LopHoc> lopHocs = new ArrayList<>();

    // 1 NhanVien -> n HopDong
    @OneToMany(mappedBy = "nhanVien", fetch = FetchType.LAZY)
    private List<HopDong> hopDongs = new ArrayList<>();

    // 1 NhanVien -> n CoVanHocSinh (cố vấn cho nhiều học sinh)
    @OneToMany(mappedBy = "nhanVien", fetch = FetchType.LAZY)
    private List<CoVanHocSinh> coVanHocSinhs = new ArrayList<>();

    public NhanVien() {
    }

    public NhanVien(String idNv) {
        this.idNv = idNv;
    }

    public String getIdNv() {
        return idNv;
    }

    public void setIdNv(String idNv) {
        this.idNv = idNv;
    }

    public TaiKhoan getTaiKhoan() {
        return taiKhoan;
    }

    public void setTaiKhoan(TaiKhoan taiKhoan) {
        this.taiKhoan = taiKhoan;
    }

    public CoSo getCoSo() {
        return coSo;
    }

    public void setCoSo(CoSo coSo) {
        this.coSo = coSo;
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

    public Boolean getGioiTinh() {
        return gioiTinh;
    }

    public void setGioiTinh(Boolean gioiTinh) {
        this.gioiTinh = gioiTinh;
    }

    public String getSdt() {
        return sdt;
    }

    public void setSdt(String sdt) {
        this.sdt = sdt;
    }

    public String getChuyenMon() {
        return chuyenMon;
    }

    public void setChuyenMon(String chuyenMon) {
        this.chuyenMon = chuyenMon;
    }

    public Integer getKinhNghiem() {
        return kinhNghiem;
    }

    public void setKinhNghiem(Integer kinhNghiem) {
        this.kinhNghiem = kinhNghiem;
    }

    public String getChucVu() {
        return chucVu;
    }

    public void setChucVu(String chucVu) {
        this.chucVu = chucVu;
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

    public List<LopHoc> getLopHocs() {
        return lopHocs;
    }

    public void setLopHocs(List<LopHoc> lopHocs) {
        this.lopHocs = lopHocs;
    }

    public List<HopDong> getHopDongs() {
        return hopDongs;
    }

    public void setHopDongs(List<HopDong> hopDongs) {
        this.hopDongs = hopDongs;
    }

    public List<CoVanHocSinh> getCoVanHocSinhs() {
        return coVanHocSinhs;
    }

    public void setCoVanHocSinhs(List<CoVanHocSinh> coVanHocSinhs) {
        this.coVanHocSinhs = coVanHocSinhs;
    }
}
