package com.mathbridge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "HopDong")
public class HopDong {

    @Id
    @Column(name = "ID_HD", length = 10, nullable = false)
    private String idHd;

    @Column(name = "ID_NV", length = 10, nullable = false)
    private String idNv;

    @Column(name = "LoaiHopDong", length = 100, nullable = false)
    private String loaiHopDong;

    @Column(name = "NgayKy", nullable = false)
    private LocalDateTime ngayKy;

    @Column(name = "NgayHieuLuc", nullable = false)
    private LocalDateTime ngayHieuLuc;

    @Column(name = "NgayKetThuc", nullable = false)
    private LocalDateTime ngayKetThuc;

    @Column(name = "TrangThai", length = 60)
    private String trangThai;

    @Column(name = "PhamViCongViec", length = 255)
    private String phamViCongViec;

    @Column(name = "HinhThucDay", length = 100, nullable = false)
    private String hinhThucDay;

    @Column(name = "ChamDutHD")
    private Boolean chamDutHd;

    @Column(name = "NgayChamDutHD")
    private LocalDateTime ngayChamDutHd;

    @Column(name = "ThoiGianTao")
    private LocalDateTime thoiGianTao;

    @Column(name = "ThoiGianCapNhat")
    private LocalDateTime thoiGianCapNhat;
    // QUAN HỆ

    @ManyToOne
    @JoinColumn(name = "ID_NV", insertable = false, updatable = false)
    private NhanVien nhanVien;
}
