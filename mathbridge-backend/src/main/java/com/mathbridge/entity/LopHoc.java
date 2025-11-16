package com.mathbridge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "LopHoc")
public class LopHoc {

    @Id
    @Column(name = "ID_LH", length = 10, nullable = false)
    private String idLh;

    @Column(name = "ID_NV", length = 10, nullable = false)
    private String idNv;

    @Column(name = "ID_CT", length = 10, nullable = false)
    private String idCt;

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

    @Column(name = "MucGia_thang", precision = 19, scale = 4, nullable = false)
    private BigDecimal mucGiaThang;

    @Column(name = "DanhGia", length = 200)
    private String danhGia;

    @Column(name = "TrangThai", length = 60)
    private String trangThai;

    @Column(name = "MoTa", length = 200)
    private String moTa;

    // QUAN HỆ

    @ManyToOne
    @JoinColumn(name = "ID_NV", insertable = false, updatable = false)
    private NhanVien nhanVien;

    @ManyToOne
    @JoinColumn(name = "ID_CT", insertable = false, updatable = false)
    private ChuongTrinh chuongTrinh;

    @OneToMany(mappedBy = "lopHoc")
    private Set<BuoiHocChiTiet> buoiHocChiTiets = new HashSet<>();

    @OneToMany(mappedBy = "lopHoc")
    private Set<DangKyLH> dangKyLhs = new HashSet<>();

    @OneToMany(mappedBy = "lopHoc")
    private Set<HoaDon> hoaDons = new HashSet<>();

    @OneToMany(mappedBy = "lopHoc")
    private Set<YeuCauHoTro> yeuCauHoTros = new HashSet<>();
}
