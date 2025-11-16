package com.mathbridge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "LichSuThanhToan")
public class LichSuThanhToan {

    @Id
    @Column(name = "ID_LS", length = 10, nullable = false)
    private String idLs;

    @Column(name = "ID_PT", length = 10, nullable = false)
    private String idPt;

    @Column(name = "TongTien", precision = 18, scale = 0, nullable = false)
    private BigDecimal tongTien;

    @Column(name = "TrangThaiThanhToan", length = 100, nullable = false)
    private String trangThaiThanhToan;

    @Column(name = "HinhThuc", length = 255, nullable = false)
    private String hinhThuc;

    @Column(name = "Thang", length = 100)
    private String thang;

    @Column(name = "GhiChu", length = 200)
    private String ghiChu;
    // QUAN HỆ

    @ManyToOne
    @JoinColumn(name = "ID_PT", insertable = false, updatable = false)
    private PhuongThucThanhToan phuongThucThanhToan;

    @OneToMany(mappedBy = "lichSuThanhToan")
    private Set<HoaDon> hoaDons = new HashSet<>();
}
