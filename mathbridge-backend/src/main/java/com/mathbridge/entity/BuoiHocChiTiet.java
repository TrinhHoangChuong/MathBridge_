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
@Table(name = "BuoiHocChiTiet")
public class BuoiHocChiTiet {

    @Id
    @Column(name = "ID_BH", length = 10, nullable = false)
    private String idBh;

    @Column(name = "ID_Phong", length = 10, nullable = false)
    private String idPhong;

    @Column(name = "ID_LH", length = 10, nullable = false)
    private String idLh;

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

    @Column(name = "NhanXetDanhGia", length = 500)
    private String nhanXetDanhGia;
    // QUAN HỆ

    @ManyToOne
    @JoinColumn(name = "ID_Phong", insertable = false, updatable = false)
    private Phong phong;

    @ManyToOne
    @JoinColumn(name = "ID_LH", insertable = false, updatable = false)
    private LopHoc lopHoc;

    @OneToMany(mappedBy = "buoiHocChiTiet")
    private Set<BaiTap> baiTaps = new HashSet<>();

    @OneToMany(mappedBy = "buoiHocChiTiet")
    private Set<DanhGiaBuoiHoc> danhGiaBuoiHocs = new HashSet<>();
}
