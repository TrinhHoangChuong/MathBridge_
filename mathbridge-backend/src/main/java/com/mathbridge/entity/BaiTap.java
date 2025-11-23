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
@Table(name = "BaiTap")
public class BaiTap {

    @Id
    @Column(name = "ID_BT", length = 10, nullable = false)
    private String idBt;

    @Column(name = "ID_BH", length = 10)
    private String idBh;

    @Column(name = "TieuDe", length = 100, nullable = false)
    private String tieuDe;

    @Column(name = "MoTa", length = 200)
    private String moTa;

    @Column(name = "LoaiBT", length = 100)
    private String loaiBt;

    @Column(name = "FileURL", length = 400)
    private String fileUrl;

    @Column(name = "TaiLieuURL", length = 400)
    private String taiLieuUrl;

    @Column(name = "NgayBatDau", nullable = false)
    private LocalDateTime ngayBatDau;

    @Column(name = "NgayKetThuc", nullable = false)
    private LocalDateTime ngayKetThuc;

    @Column(name = "GhiChu", length = 200)
    private String ghiChu;

    @Column(name = "ChoPhepLamBai")
    private Boolean choPhepLamBai;

    @Column(name = "HocSinhDuocPhep", length = 1000)
    private String hocSinhDuocPhep;

    @ManyToOne
    @JoinColumn(name = "ID_BH", insertable = false, updatable = false)
    private BuoiHocChiTiet buoiHocChiTiet;

    @OneToMany(mappedBy = "baiTap")
    private Set<BaiNop> baiNops = new HashSet<>();
}
