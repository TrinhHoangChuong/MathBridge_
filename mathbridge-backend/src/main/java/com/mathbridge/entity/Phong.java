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
@Table(name = "Phong")
public class Phong {

    @Id
    @Column(name = "ID_Phong", length = 10, nullable = false)
    private String idPhong;

    @Column(name = "ID_CS", length = 10, nullable = false)
    private String idCs;

    @Column(name = "TenPhong", length = 100, nullable = false)
    private String tenPhong;

    @Column(name = "Tang", length = 3)
    private String tang;

    @Column(name = "LoaiPhong", length = 100)
    private String loaiPhong;

    @Column(name = "GhiChu", length = 200)
    private String ghiChu;

    // QUAN HỆ

    @ManyToOne
    @JoinColumn(name = "ID_CS", insertable = false, updatable = false)
    private CoSo coSo;

    @OneToMany(mappedBy = "phong")
    private Set<BuoiHocChiTiet> buoiHocChiTiets = new HashSet<>();
}
