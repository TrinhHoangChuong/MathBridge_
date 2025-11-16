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
@Table(name = "LienHeTuVan")
public class LienHeTuVan {

    @Id
    @Column(name = "ID_TV", length = 10, nullable = false)
    private String idTv;

    @Column(name = "HoTen", length = 100, nullable = false)
    private String hoTen;

    @Column(name = "Email", length = 100)
    private String email;

    @Column(name = "SDT", length = 100, nullable = false)
    private String sdt;

    @Column(name = "TieuDe", length = 100, nullable = false)
    private String tieuDe;

    @Column(name = "NoiDung", length = 200)
    private String noiDung;

    @Column(name = "HinhThucTuVan", length = 100, nullable = false)
    private String hinhThucTuVan;

    @Column(name = "ThoiDiemTao")
    private LocalDateTime thoiDiemTao;

    @Column(name = "TrangThai", length = 60)
    private String trangThai;
}
