package com.mathbridge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "NhanVien")
public class NhanVien {

    @Id
    @Column(name = "ID_NV", length = 10, nullable = false)
    private String idNv;

    @Column(name = "ID_TK", length = 10, nullable = false)
    private String idTk;

    @Column(name = "ID_CS", length = 10, nullable = false)
    private String idCs;

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
    // QUAN HỆ

    @ManyToOne
    @JoinColumn(name = "ID_CS", insertable = false, updatable = false)
    private CoSo coSo;

    @ManyToOne
    @JoinColumn(name = "ID_TK", insertable = false, updatable = false)
    private TaiKhoan taiKhoan;

    @OneToMany(mappedBy = "nhanVien")
    private Set<CoVan_HocSinh> coVanHocSinhs = new HashSet<>();

    @OneToMany(mappedBy = "nhanVien")
    private Set<HopDong> hopDongs = new HashSet<>();

    @OneToMany(mappedBy = "nhanVien")
    private Set<LopHoc> lopHocs = new HashSet<>();
}
