package com.mathbridge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "CoSo")
public class CoSo {

    @Id
    @Column(name = "ID_CS", length = 10, nullable = false)
    private String idCs;

    @Column(name = "TENCOSO", length = 200, nullable = false)
    private String tenCoSo;

    @Column(name = "DIACHI2", length = 200, nullable = false)
    private String diaChi2;

    @Column(name = "HOTLINE", length = 100, nullable = false)
    private String hotline;

    @Column(name = "GIOMOCUA")
    private LocalTime gioMoCua;

    @Column(name = "GIODONGCUA")
    private LocalTime gioDongCua;

    @Column(name = "NGAYLAMVIEC", length = 100, nullable = false)
    private String ngayLamViec;
    // QUAN HỆ

    @OneToMany(mappedBy = "coSo")
    private Set<NhanVien> nhanViens = new HashSet<>();

    @OneToMany(mappedBy = "coSo")
    private Set<Phong> phongs = new HashSet<>();

    @OneToMany(mappedBy = "coSo")
    private Set<CS_DaoTao_CT> csDaoTaoCts = new HashSet<>();
}
