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
@Table(name = "DanhGiaBuoiHoc")
public class DanhGiaBuoiHoc {

    @Id
    @Column(name = "ID_DGBH", length = 10, nullable = false)
    private String idDgbh;

    @Column(name = "ID_BH", length = 10, nullable = false)
    private String idBh;

    @Column(name = "ID_HS", length = 10, nullable = false)
    private String idHs;

    @Column(name = "DiemDanhGia", nullable = false)
    private Integer diemDanhGia; // tinyint

    @Column(name = "NhanXet", length = 400)
    private String nhanXet;

    @Column(name = "ThoiDiemDanhGia", nullable = false)
    private LocalDateTime thoiDiemDanhGia;
    // QUAN HỆ

    @ManyToOne
    @JoinColumn(name = "ID_BH", insertable = false, updatable = false)
    private BuoiHocChiTiet buoiHocChiTiet;

    @ManyToOne
    @JoinColumn(name = "ID_HS", insertable = false, updatable = false)
    private HocSinh hocSinh;
}
