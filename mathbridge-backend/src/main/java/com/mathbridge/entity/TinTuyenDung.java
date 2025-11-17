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
@Table(name = "TinTuyenDung")
public class TinTuyenDung {

    @Id
    @Column(name = "ID_TD", length = 10, nullable = false)
    private String idTd;

    @Column(name = "TieuDe", length = 100, nullable = false)
    private String tieuDe;

    @Column(name = "ViTri", length = 100, nullable = false)
    private String viTri;

    @Column(name = "MoTaNgan", length = 255)
    private String moTaNgan;

    @Column(name = "MoTa", length = 200, nullable = false)
    private String moTa;

    @Column(name = "YeuCau", length = 255, nullable = false)
    private String yeuCau;

    @Column(name = "CapBac", length = 100)
    private String capBac;

    @Column(name = "HinhThucLamViec", length = 100)
    private String hinhThucLamViec;

    @Column(name = "MucLuongTu", length = 255)
    private String mucLuongTu;

    @Column(name = "MucLuongDen", length = 255)
    private String mucLuongDen;

    @Column(name = "KinhNghiem")
    private Integer kinhNghiem;

    @Column(name = "SoLuongTuyen")
    private Integer soLuongTuyen;

    @Column(name = "HanNop")
    private LocalDateTime hanNop;

    @Column(name = "TrangThai", length = 60)
    private String trangThai;
    // QUAN HỆ

    @OneToMany(mappedBy = "tinTuyenDung")
    private Set<Association_25> associations = new HashSet<>();
}
