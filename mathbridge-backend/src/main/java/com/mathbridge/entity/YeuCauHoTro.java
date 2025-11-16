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
@Table(name = "YeuCauHoTro")
public class YeuCauHoTro {

    @Id
    @Column(name = "ID_YC", length = 10, nullable = false)
    private String idYc;

    @Column(name = "ID_LH", length = 10)
    private String idLh;

    @Column(name = "TieuDe", length = 100, nullable = false)
    private String tieuDe;

    @Column(name = "NoiDung", length = 200, nullable = false)
    private String noiDung;

    @Column(name = "FileURL", length = 400)
    private String fileUrl;

    @Column(name = "LoaiYeuCau", length = 100)
    private String loaiYeuCau;

    @Column(name = "TrangThai", length = 60)
    private String trangThai;

    @Column(name = "ThoiDiemTao")
    private LocalDateTime thoiDiemTao;

    @Column(name = "ThoiDiemDong")
    private LocalDateTime thoiDiemDong;
    // QUAN HỆ

    @ManyToOne
    @JoinColumn(name = "ID_LH", insertable = false, updatable = false)
    private LopHoc lopHoc;
}
