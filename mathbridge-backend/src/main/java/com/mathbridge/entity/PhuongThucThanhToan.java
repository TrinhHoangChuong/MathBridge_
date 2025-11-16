package com.mathbridge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "PhuongThucThanhToan")
public class PhuongThucThanhToan {

    @Id
    @Column(name = "ID_PT", length = 10, nullable = false)
    private String idPt;

    @Column(name = "TenPT", length = 100, nullable = false)
    private String tenPt;

    @Column(name = "HinhThucTT", length = 100, nullable = false)
    private String hinhThucTt;

    @Column(name = "GhiChu", length = 200)
    private String ghiChu;
    // QUAN HỆ

    @OneToMany(mappedBy = "phuongThucThanhToan")
    private Set<LichSuThanhToan> lichSuThanhToans = new HashSet<>();
}
