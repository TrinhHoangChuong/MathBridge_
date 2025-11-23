package com.mathbridge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "HocSinh")
public class HocSinh {

    @Id
    @Column(name = "ID_HS", length = 10, nullable = false)
    private String idHs;

    @Column(name = "ID_TK", length = 10, nullable = false)
    private String idTk;

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

    @Column(name = "NgaySinh")
    private LocalDate ngaySinh;

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

    // QUAN HỆ

    @ManyToOne
    @JoinColumn(name = "ID_TK", insertable = false, updatable = false)
    private TaiKhoan taiKhoan;

    @OneToMany(mappedBy = "hocSinh")
    private Set<CoVan_HocSinh> coVanHocSinhs = new HashSet<>();

    @OneToMany(mappedBy = "hocSinh")
    private Set<DangKyLH> dangKyLhs = new HashSet<>();

    @OneToMany(mappedBy = "hocSinh")
    private Set<DanhGiaBuoiHoc> danhGiaBuoiHocs = new HashSet<>();

    @OneToMany(mappedBy = "hocSinh")
    private Set<DanhGiaLopHoc> danhGiaLopHocs = new HashSet<>();

    @OneToMany(mappedBy = "hocSinh")
    private Set<BaiNop> baiNops = new HashSet<>();

    @OneToMany(mappedBy = "hocSinh")
    private Set<HoaDon> hoaDons = new HashSet<>();

    @OneToMany(mappedBy = "hocSinh")
    private Set<KetQuaHocTap> ketQuaHocTaps = new HashSet<>();

}
