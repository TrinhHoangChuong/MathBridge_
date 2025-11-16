package com.mathbridge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "HoaDon")
public class HoaDon {

    @Id
    @Column(name = "ID_HoaDon", length = 10, nullable = false)
    private String idHoaDon;

    @Column(name = "ID_LH", length = 10, nullable = false)
    private String idLh;

    @Column(name = "ID_LS", length = 10)
    private String idLs;

    @Column(name = "ID_HS", length = 10, nullable = false)
    private String idHs;

    @Column(name = "NgayDangKy")
    private LocalDate ngayDangKy;

    @Column(name = "NgayThanhToan")
    private LocalDate ngayThanhToan;

    @Column(name = "HanThanhToan")
    private LocalDate hanThanhToan;

    @Column(name = "SoThang", length = 100)
    private String soThang;

    @Column(name = "TongTien", precision = 18, scale = 0)
    private BigDecimal tongTien;

    @Column(name = "TrangThai", length = 60)
    private String trangThai;
    // QUAN HỆ

    @ManyToOne
    @JoinColumn(name = "ID_LH", insertable = false, updatable = false)
    private LopHoc lopHoc;

    @ManyToOne
    @JoinColumn(name = "ID_LS", insertable = false, updatable = false)
    private LichSuThanhToan lichSuThanhToan;

    @ManyToOne
    @JoinColumn(name = "ID_HS", insertable = false, updatable = false)
    private HocSinh hocSinh;
}
